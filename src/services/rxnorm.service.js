const apiClient = require("../utils/apiClient");

// RxNorm API base URL
const RXNORM_BASE_URL =
  process.env.RXNORM_BASE_URL || "https://rxnav.nlm.nih.gov/REST";

// Find medicine and return its RxCUI
const findMedicine = async (medicineName) => {
  // Search medicine name in RxNorm
  const data = await apiClient.get(
    `${RXNORM_BASE_URL}/rxcui.json`,
    {
      name: medicineName,
    }
  );

  // Extract RxCUI from response
  const rxcui = data?.idGroup?.rxnormId?.[0];

  if (!rxcui) {
    throw new Error("Medicine not found in RxNorm");
  }

  return {
    rxcui,
    inputName: medicineName,
  };
};

module.exports = {
  findMedicine,
};