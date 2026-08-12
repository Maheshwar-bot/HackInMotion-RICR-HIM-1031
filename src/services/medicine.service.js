// Medicine analysis service

const rxnormService = require("./rxnorm.service");

// Analyze medicine name using RxNorm
const analyzeMedicine = async (medicineName) => {
  // Validate medicine input
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  // Find medicine in RxNorm
  const medicine = await rxnormService.findMedicine(
    medicineName.trim()
  );

  return {
    medicine: medicine.inputName,
    rxcui: medicine.rxcui,
  };
};

module.exports = {
  analyzeMedicine,
};