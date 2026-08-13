const SearchHistory = require("../models/searchHistory.model");

// ==================================================
// Create search history
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
  // Get medicine names from prescription
  const medicineNames = medicines
    .map(
      (medicine) =>
        medicine?.normalizedName ||
        medicine?.originalName
    )
    .filter(Boolean);

  return SearchHistory.create({
    userId,

    // History model currently supports medicine1/medicine2
    medicine1: medicineNames[0] || null,
    medicine2: medicineNames[1] || null,

    riskLevel,
    mode,

    source: "prescription",

    prescriptionId,
  });
};

// ==================================================
// Get user's search history
// ==================================================

const getUserSearchHistory = async (userId) => {
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