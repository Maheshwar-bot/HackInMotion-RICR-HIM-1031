const SearchHistory = require("../models/searchHistory.model");

// ==================================================
// Create manual medicine search history
// ==================================================

const createSearchHistory = async ({
  userId,
  medicine1 = null,
  medicine2 = null,
  riskLevel = "Unable to determine",
  mode = "normal",
  source = "manual",
  prescriptionId = null,
}) => {
  return SearchHistory.create({
    userId,

    medicine1,
    medicine2,

    riskLevel,
    mode,

    source,
    prescriptionId,
  });
};

// ==================================================
// Create prescription analysis history
// ==================================================

const createPrescriptionSearchHistory = async ({
  userId,
  prescriptionId,
  medicines = [],
  riskLevel = "Unable to determine",
  mode = "normal",
}) => {
  // --------------------------------------------------
  // Get medicine names from validated prescription
  // medicines
  // --------------------------------------------------

  const medicineNames = medicines
    .map(
      (medicine) =>
        medicine?.normalizedName ||
        medicine?.originalName ||
        ""
    )
    .map((name) => name.trim())
    .filter(Boolean);

  // --------------------------------------------------
  // Create prescription history
  // --------------------------------------------------

  return SearchHistory.create({
    userId,

    // History model supports medicine1 and medicine2.
    // For prescription analysis:
    // medicine1 = first detected medicine
    // medicine2 = second detected medicine, if available
    medicine1:
      medicineNames[0] || null,

    medicine2:
      medicineNames[1] || null,

    riskLevel,

    mode,

    source: "prescription",

    prescriptionId:
      prescriptionId || null,
  });
};

// ==================================================
// Get user's search history
// ==================================================

const getUserSearchHistory = async (
  userId
) => {
  return SearchHistory.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

// ==================================================
// Exports
// ==================================================

module.exports = {
  createSearchHistory,
  createPrescriptionSearchHistory,
  getUserSearchHistory,
};