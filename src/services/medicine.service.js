// Main medicine analysis service

const rxnormService = require("./rxnorm.service");
const dailymedService = require("./dailymed.service");
const openfdaService = require("./openfda.service");
const aiService = require("./ai.service");

// Get text from a value
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

// Remove duplicate text values
const uniqueValues = (values) => {
  return [...new Set(
    values
      .map((value) => getText(value))
      .filter(Boolean)
  )];
};

// Find useful sections inside DailyMed parsed JSON
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

// Find section by keywords
const findSection = (sections, keywords) => {
  const section = sections.find((item) => {
    const title = item.title.toLowerCase();

    return keywords.some((keyword) =>
      title.includes(keyword)
    );
  });

  return section ? section.text : "";
};

// Normalize DailyMed data
const normalizeDailyMed = (dailymedData) => {
  if (!dailymedData?.found || !dailymedData?.label) {
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

// Normalize openFDA safety data
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
      records.map((record) => record.warnings)
    ),

    contraindications: uniqueValues(
      records.map(
        (record) => record.contraindications
      )
    ),

    adverseReactions: uniqueValues(
      records.map(
        (record) => record.adverse_reactions
      )
    ),

    drugInteractions: uniqueValues(
      records.map(
        (record) => record.drug_interactions
      )
    ),
  };
};

// Build interaction evidence from retrieved medical data
const buildInteractionEvidence = (
  medicine1Data,
  medicine2Data
) => {
  const medicine1Interactions =
    medicine1Data?.safety?.drugInteractions || [];

  const medicine2Interactions =
    medicine2Data?.safety?.drugInteractions || [];

  const medicine1Warnings =
    medicine1Data?.safety?.warnings || [];

  const medicine2Warnings =
    medicine2Data?.safety?.warnings || [];

  const medicine1Contraindications =
    medicine1Data?.safety?.contraindications || [];

  const medicine2Contraindications =
    medicine2Data?.safety?.contraindications || [];

  const available =
    medicine1Interactions.length > 0 ||
    medicine2Interactions.length > 0;

  return {
    available,

    medicine1Interactions,

    medicine2Interactions,

    relevantWarnings: [
      ...medicine1Warnings,
      ...medicine2Warnings,
    ],

    relevantContraindications: [
      ...medicine1Contraindications,
      ...medicine2Contraindications,
    ],

    evidenceSource: "openFDA",
  };
};

// Get complete information for one medicine
const getMedicineData = async (medicineName) => {
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  const normalizedName = medicineName.trim();

  // Identify medicine using RxNorm
  const rxnormData =
    await rxnormService.findMedicine(
      normalizedName
    );

  // Get drug information from DailyMed using RxCUI
  const dailymedData =
    await dailymedService.getDrugInfo(
      rxnormData.rxcui,
      rxnormData
    );

  // Get safety data from openFDA
  const openfdaData =
    await openfdaService.getSafetyData(
      normalizedName,
      rxnormData
    );

  // Normalize DailyMed data
  const normalizedDailyMed =
    normalizeDailyMed(dailymedData);

  // Normalize openFDA data
  const normalizedOpenFDA =
    normalizeOpenFDA(openfdaData);

  return {
    medicine: normalizedName,
    rxcui: rxnormData.rxcui,

    drugInfo: normalizedDailyMed,

    safety: normalizedOpenFDA,
  };
};

// Analyze one or two medicines
const analyzeMedicine = async (
  medicineName1,
  medicineName2
) => {
  // Validate first medicine
  if (!medicineName1 || !medicineName1.trim()) {
    throw new Error(
      "First medicine name is required"
    );
  }

  // Validate second medicine
  if (!medicineName2 || !medicineName2.trim()) {
    throw new Error(
      "Second medicine name is required"
    );
  }

  // Get complete data for both medicines
  const [
    medicine1Data,
    medicine2Data,
  ] = await Promise.all([
    getMedicineData(medicineName1),
    getMedicineData(medicineName2),
  ]);

  // Build interaction evidence
  const interactionEvidence =
    buildInteractionEvidence(
      medicine1Data,
      medicine2Data
    );

  // Combine trusted medical data
  const combinedMedicineData = {
    medicine1: medicine1Data,
    medicine2: medicine2Data,
    interactionEvidence,
  };

  // Ask AI to analyze the combination
  const aiAnalysis =
    await aiService.analyzeMedicineWithAI(
      combinedMedicineData
    );

  // Final response
  return {
    medicine1: medicine1Data,
    medicine2: medicine2Data,
    interactionEvidence,
    interactionAnalysis: aiAnalysis,
  };
};

module.exports = {
  analyzeMedicine,
};