// Main medicine analysis service

const rxnormService = require("./rxnorm.service");
const dailymedService = require("./dailymed.service");
const openfdaService = require("./openfda.service");
const aiService = require("./ai.service");

// ======================================================
// Utility: Get text from a value
// ======================================================

const getText = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(getText)
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map(getText)
      .filter(Boolean)
      .join(" ");
  }

  return "";
};

// ======================================================
// Remove duplicate text values
// ======================================================

const uniqueValues = (values) => {
  return [
    ...new Set(
      values
        .map((value) => getText(value))
        .filter(Boolean)
    ),
  ];
};

// ======================================================
// Find useful sections inside DailyMed parsed JSON
// ======================================================

const findDailyMedSections = (data) => {
  const sections = [];

  const walk = (value) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value !== "object") {
      return;
    }

    if (value.title || value.Title) {
      const title = getText(
        value.title || value.Title
      );

      const text = getText(
        value.text || value.Text
      );

      if (title && text) {
        sections.push({
          title,
          text,
        });
      }
    }

    Object.values(value).forEach(walk);
  };

  walk(data);

  return sections;
};

// ======================================================
// Find section by keywords
// ======================================================

const findSection = (sections, keywords) => {
  const section = sections.find((item) => {
    const title = item.title.toLowerCase();

    return keywords.some((keyword) =>
      title.includes(keyword)
    );
  });

  return section ? section.text : "";
};

// ======================================================
// Normalize DailyMed data
// ======================================================

const normalizeDailyMed = (dailymedData) => {
  if (
    !dailymedData?.found ||
    !dailymedData?.label
  ) {
    return {
      found: false,
      uses: "",
      composition: "",
      dosage: "",
      warnings: "",
      contraindications: "",
      sideEffects: "",
      administration: "",
    };
  }

  const sections = findDailyMedSections(
    dailymedData.label.data
  );

  return {
    found: true,

    uses: findSection(sections, [
      "indications and usage",
      "indications & usage",
      "indications",
    ]),

    composition: findSection(sections, [
      "description",
      "active ingredient",
      "ingredients",
    ]),

    dosage: findSection(sections, [
      "dosage and administration",
      "dosage & administration",
      "dosage",
    ]),

    warnings: findSection(sections, [
      "warnings",
      "boxed warning",
      "warnings and precautions",
    ]),

    contraindications: findSection(sections, [
      "contraindications",
    ]),

    sideEffects: findSection(sections, [
      "adverse reactions",
      "adverse effects",
      "side effects",
    ]),

    administration: findSection(sections, [
      "administration",
    ]),
  };
};

// ======================================================
// Normalize openFDA safety data
// ======================================================

const normalizeOpenFDA = (openfdaData) => {
  if (
    !openfdaData?.found ||
    !openfdaData?.records?.length
  ) {
    return {
      found: false,
      warnings: [],
      contraindications: [],
      adverseReactions: [],
      drugInteractions: [],
    };
  }

  const records = openfdaData.records;

  return {
    found: true,

    warnings: uniqueValues(
      records.map(
        (record) => record.warnings
      )
    ),

    contraindications: uniqueValues(
      records.map(
        (record) =>
          record.contraindications
      )
    ),

    adverseReactions: uniqueValues(
      records.map(
        (record) =>
          record.adverse_reactions
      )
    ),

    drugInteractions: uniqueValues(
      records.map(
        (record) =>
          record.drug_interactions
      )
    ),
  };
};

// ======================================================
// Normalize text for pair matching
// ======================================================

const normalizeForMatch = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ======================================================
// Check whether interaction evidence explicitly
// mentions the other medicine
// ======================================================

const findPairEvidence = (
  interactions,
  targetMedicineName
) => {
  if (
    !Array.isArray(interactions) ||
    !targetMedicineName
  ) {
    return [];
  }

  const normalizedTarget =
    normalizeForMatch(
      targetMedicineName
    );

  if (!normalizedTarget) {
    return [];
  }

  return interactions.filter(
    (interaction) => {
      const interactionText =
        normalizeForMatch(
          interaction
        );

      return interactionText.includes(
        normalizedTarget
      );
    }
  );
};

// ======================================================
// Build PAIR-SPECIFIC interaction evidence
// ======================================================

const buildInteractionEvidence = (
  medicine1Data,
  medicine2Data
) => {
  const medicine1Interactions =
    medicine1Data?.safety
      ?.drugInteractions || [];

  const medicine2Interactions =
    medicine2Data?.safety
      ?.drugInteractions || [];

  const medicine1Warnings =
    medicine1Data?.safety?.warnings || [];

  const medicine2Warnings =
    medicine2Data?.safety?.warnings || [];

  const medicine1Contraindications =
    medicine1Data?.safety
      ?.contraindications || [];

  const medicine2Contraindications =
    medicine2Data?.safety
      ?.contraindications || [];

  // --------------------------------------------------
  // Normalize medicine names
  // --------------------------------------------------

  const medicine1Name =
    normalizeForMatch(
      medicine1Data?.medicine
    );

  const medicine2Name =
    normalizeForMatch(
      medicine2Data?.medicine
    );

  // --------------------------------------------------
  // Medicine 1 -> Medicine 2
  // --------------------------------------------------

  const medicine1ToMedicine2 =
    findPairEvidence(
      medicine1Interactions,
      medicine2Name
    );

  // --------------------------------------------------
  // Medicine 2 -> Medicine 1
  // --------------------------------------------------

  const medicine2ToMedicine1 =
    findPairEvidence(
      medicine2Interactions,
      medicine1Name
    );

  // --------------------------------------------------
  // Store only direct pair-specific evidence
  // --------------------------------------------------

  const directPairEvidence = [];

  medicine1ToMedicine2.forEach(
    (evidence) => {
      directPairEvidence.push({
        fromMedicine:
          medicine1Data?.medicine,

        fromRxcui:
          medicine1Data?.rxcui,

        againstMedicine:
          medicine2Data?.medicine,

        againstRxcui:
          medicine2Data?.rxcui,

        evidence,
      });
    }
  );

  medicine2ToMedicine1.forEach(
    (evidence) => {
      directPairEvidence.push({
        fromMedicine:
          medicine2Data?.medicine,

        fromRxcui:
          medicine2Data?.rxcui,

        againstMedicine:
          medicine1Data?.medicine,

        againstRxcui:
          medicine1Data?.rxcui,

        evidence,
      });
    }
  );

  // --------------------------------------------------
  // Direct pair evidence availability
  // --------------------------------------------------

  const directPairEvidenceAvailable =
    directPairEvidence.length > 0;

  return {
    // IMPORTANT:
    // This now means DIRECT pair evidence only.
    available:
      directPairEvidenceAvailable,

    directPairEvidenceAvailable,

    directPairEvidence,

    // --------------------------------------------------
    // Raw interaction data
    // --------------------------------------------------

    medicine1Interactions,

    medicine2Interactions,

    // --------------------------------------------------
    // Individual warnings
    // These are NOT direct interactions.
    // --------------------------------------------------

    relevantWarnings: [
      ...medicine1Warnings,
      ...medicine2Warnings,
    ],

    // --------------------------------------------------
    // Individual contraindications
    // --------------------------------------------------

    relevantContraindications: [
      ...medicine1Contraindications,
      ...medicine2Contraindications,
    ],

    evidenceSource: "openFDA",
  };
};

// ======================================================
// Get complete information for ONE medicine
// ======================================================

const getMedicineData = async (
  medicineName
) => {
  if (
    !medicineName ||
    !medicineName.trim()
  ) {
    throw new Error(
      "Medicine name is required"
    );
  }

  const normalizedName =
    medicineName.trim();

  // --------------------------------------------------
  // 1. Identify medicine using RxNorm
  // --------------------------------------------------

  const rxnormData =
    await rxnormService.findMedicine(
      normalizedName
    );

  // --------------------------------------------------
  // 2. Get drug information from DailyMed
  // --------------------------------------------------

  const dailymedData =
    await dailymedService.getDrugInfo(
      rxnormData.rxcui,
      rxnormData
    );

  // --------------------------------------------------
  // 3. Get safety data from openFDA
  // --------------------------------------------------

  const openfdaData =
    await openfdaService.getSafetyData(
      normalizedName,
      rxnormData
    );

  // --------------------------------------------------
  // 4. Normalize DailyMed
  // --------------------------------------------------

  const normalizedDailyMed =
    normalizeDailyMed(
      dailymedData
    );

  // --------------------------------------------------
  // 5. Normalize openFDA
  // --------------------------------------------------

  const normalizedOpenFDA =
    normalizeOpenFDA(
      openfdaData
    );

  // --------------------------------------------------
  // Final medicine data
  // --------------------------------------------------

  return {
    medicine: normalizedName,

    rxcui:
      rxnormData.rxcui,

    drugInfo:
      normalizedDailyMed,

    safety:
      normalizedOpenFDA,
  };
};

// ======================================================
// Analyze TWO medicines
// ======================================================

const analyzeMedicine = async (
  medicineName1,
  medicineName2,
  mode = "normal"
) => {
  // --------------------------------------------------
  // Validate first medicine
  // --------------------------------------------------

  if (
    !medicineName1 ||
    !medicineName1.trim()
  ) {
    throw new Error(
      "First medicine name is required"
    );
  }

  // --------------------------------------------------
  // Validate second medicine
  // --------------------------------------------------

  if (
    !medicineName2 ||
    !medicineName2.trim()
  ) {
    throw new Error(
      "Second medicine name is required"
    );
  }

  // --------------------------------------------------
  // Normalize mode
  // --------------------------------------------------

  const responseMode =
    mode?.toLowerCase() === "expert"
      ? "expert"
      : "normal";

  // --------------------------------------------------
  // Get complete data for both medicines
  // --------------------------------------------------

  const [
    medicine1Data,
    medicine2Data,
  ] = await Promise.all([
    getMedicineData(
      medicineName1
    ),

    getMedicineData(
      medicineName2
    ),
  ]);

  // --------------------------------------------------
  // Build pair-specific interaction evidence
  // --------------------------------------------------

  const interactionEvidence =
    buildInteractionEvidence(
      medicine1Data,
      medicine2Data
    );

  // --------------------------------------------------
  // Combine trusted medical data
  // --------------------------------------------------

  const combinedMedicineData = {
    medicine1:
      medicine1Data,

    medicine2:
      medicine2Data,

    interactionEvidence,
  };

  // --------------------------------------------------
  // Ask Gemini to analyze combination
  // --------------------------------------------------

  const aiAnalysis =
    await aiService.analyzeMedicineWithAI(
      combinedMedicineData,
      responseMode
    );

  // --------------------------------------------------
  // Validate structured risk level
  // --------------------------------------------------

  const allowedRiskLevels = [
    "Low",
    "Moderate",
    "High",
    "Critical",
    "Unable to determine",
  ];

  const riskLevel =
    allowedRiskLevels.includes(
      aiAnalysis?.riskLevel
    )
      ? aiAnalysis.riskLevel
      : "Unable to determine";

  // --------------------------------------------------
  // Final response
  // --------------------------------------------------

  return {
    medicine1:
      medicine1Data,

    medicine2:
      medicine2Data,

    interactionEvidence,

    // Required by controller
    // for SearchHistory
    riskLevel,

    mode:
      responseMode,

    interactionAnalysis:
      aiAnalysis?.analysis || "",
  };
};

// ======================================================
// Analyze VALIDATED prescription medicines
// ======================================================

const analyzePrescriptionMedicines = async (
  medicines,
  mode = "normal"
) => {
  // --------------------------------------------------
  // Validate medicines array
  // --------------------------------------------------

  if (!Array.isArray(medicines)) {
    throw new Error(
      "Prescription medicines are required"
    );
  }

  // --------------------------------------------------
  // Only use RxNorm validated medicines
  // --------------------------------------------------

  const validatedMedicines =
    medicines.filter(
      (medicine) =>
        medicine?.validated === true &&
        medicine?.normalizedName &&
        medicine?.rxcui
    );

  if (!validatedMedicines.length) {
    throw new Error(
      "No validated medicines available for analysis"
    );
  }

  // --------------------------------------------------
  // Remove duplicate medicines using RxCUI
  // --------------------------------------------------

  const uniqueMedicines = [
    ...new Map(
      validatedMedicines.map(
        (medicine) => [
          medicine.rxcui,
          medicine,
        ]
      )
    ).values(),
  ];

  // --------------------------------------------------
  // Retrieve complete trusted data
  // --------------------------------------------------

  const medicineData =
    await Promise.all(
      uniqueMedicines.map(
        async (medicine) => {
          const data =
            await getMedicineData(
              medicine.normalizedName
            );

          return {
            ...data,

            prescriptionInfo: {
              strength:
                medicine.strength ||
                "",

              instructions:
                medicine.instructions ||
                "",

              confidence:
                medicine.confidence ||
                "unknown",
            },
          };
        }
      )
    );

  // --------------------------------------------------
  // Build pair-specific interaction evidence
  // for EVERY medicine pair
  // --------------------------------------------------

  const interactionEvidence = [];

  for (
    let i = 0;
    i < medicineData.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < medicineData.length;
      j++
    ) {
      const medicine1 =
        medicineData[i];

      const medicine2 =
        medicineData[j];

      const medicine1Interactions =
        medicine1?.safety
          ?.drugInteractions || [];

      const medicine2Interactions =
        medicine2?.safety
          ?.drugInteractions || [];

      const medicine1Name =
        normalizeForMatch(
          medicine1.medicine
        );

      const medicine2Name =
        normalizeForMatch(
          medicine2.medicine
        );

      // Medicine 1 -> Medicine 2
      const medicine1ToMedicine2 =
        findPairEvidence(
          medicine1Interactions,
          medicine2Name
        );

      // Medicine 2 -> Medicine 1
      const medicine2ToMedicine1 =
        findPairEvidence(
          medicine2Interactions,
          medicine1Name
        );

      const directPairEvidence = [];

      medicine1ToMedicine2.forEach(
        (evidence) => {
          directPairEvidence.push({
            fromMedicine:
              medicine1.medicine,

            fromRxcui:
              medicine1.rxcui,

            againstMedicine:
              medicine2.medicine,

            againstRxcui:
              medicine2.rxcui,

            evidence,
          });
        }
      );

      medicine2ToMedicine1.forEach(
        (evidence) => {
          directPairEvidence.push({
            fromMedicine:
              medicine2.medicine,

            fromRxcui:
              medicine2.rxcui,

            againstMedicine:
              medicine1.medicine,

            againstRxcui:
              medicine1.rxcui,

            evidence,
          });
        }
      );

      interactionEvidence.push({
        medicine1:
          medicine1.medicine,

        medicine1Rxcui:
          medicine1.rxcui,

        medicine2:
          medicine2.medicine,

        medicine2Rxcui:
          medicine2.rxcui,

        directPairEvidenceAvailable:
          directPairEvidence.length > 0,

        directPairEvidence,

        // Raw evidence is retained for transparency
        medicine1Interactions,

        medicine2Interactions,

        medicine1Warnings:
          medicine1?.safety
            ?.warnings || [],

        medicine2Warnings:
          medicine2?.safety
            ?.warnings || [],

        medicine1Contraindications:
          medicine1?.safety
            ?.contraindications || [],

        medicine2Contraindications:
          medicine2?.safety
            ?.contraindications || [],

        evidenceSource:
          "openFDA",
      });
    }
  }

  // --------------------------------------------------
  // Combine data for Gemini
  // --------------------------------------------------

  const combinedMedicineData = {
    medicines:
      medicineData,

    interactionEvidence,
  };

  // --------------------------------------------------
  // Normalize mode
  // --------------------------------------------------

  const responseMode =
    mode?.toLowerCase() === "expert"
      ? "expert"
      : "normal";

  // --------------------------------------------------
  // Ask Gemini to analyze prescription
  // --------------------------------------------------

  const aiAnalysis =
    await aiService.analyzePrescriptionWithAI(
      combinedMedicineData,
      responseMode
    );

  // --------------------------------------------------
  // Validate structured risk level
  // --------------------------------------------------

  const allowedRiskLevels = [
    "Low",
    "Moderate",
    "High",
    "Critical",
    "Unable to determine",
  ];

  const riskLevel =
    allowedRiskLevels.includes(
      aiAnalysis?.riskLevel
    )
      ? aiAnalysis.riskLevel
      : "Unable to determine";

  // --------------------------------------------------
  // Final prescription response
  // --------------------------------------------------

  return {
    medicines:
      medicineData,

    interactionEvidence,

    // Required for history
    riskLevel,

    mode:
      responseMode,

    interactionAnalysis:
      aiAnalysis?.analysis || "",
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  analyzeMedicine,
  analyzePrescriptionMedicines,
};