// Main medicine analysis service

const rxnormService = require("./rxnorm.service");
const dailymedService = require("./dailymed.service");
const openfdaService = require("./openfda.service");

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

    // DailyMed section
    if (value.title || value.Title) {
      const title = getText(value.title || value.Title);
      const text = getText(value.text || value.Text);

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
  if (!openfdaData?.found || !openfdaData?.records?.length) {
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

    warnings: records
      .map((record) => getText(record.warnings))
      .filter(Boolean),

    contraindications: records
      .map((record) => getText(record.contraindications))
      .filter(Boolean),

    adverseReactions: records
      .map((record) => getText(record.adverse_reactions))
      .filter(Boolean),

    drugInteractions: records
      .map((record) => getText(record.drug_interactions))
      .filter(Boolean),
  };
};

// Analyze medicine using all medicine data sources
const analyzeMedicine = async (medicineName) => {
  // Validate medicine input
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  const normalizedName = medicineName.trim();

  // Identify medicine using RxNorm
  const rxnormData =
    await rxnormService.findMedicine(normalizedName);

  // Get drug information from DailyMed using RxCUI
  const dailymedData =
    await dailymedService.getDrugInfo(
      rxnormData.rxcui
    );

  // Get safety data from openFDA
  const openfdaData =
    await openfdaService.getSafetyData(
      normalizedName
    );

  // Convert large DailyMed data into useful fields
  const normalizedDailyMed =
    normalizeDailyMed(dailymedData);

  // Convert openFDA data into useful safety fields
  const normalizedOpenFDA =
    normalizeOpenFDA(openfdaData);

  // Final clean medicine data
  return {
    medicine: normalizedName,
    rxcui: rxnormData.rxcui,

    drugInfo: normalizedDailyMed,

    safety: normalizedOpenFDA,
  };
};

module.exports = {
  analyzeMedicine,
};