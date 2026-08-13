const apiClient = require("../utils/apiClient");

// RxNorm API base URL
const RXNORM_BASE_URL =
  process.env.RXNORM_BASE_URL ||
  "https://rxnav.nlm.nih.gov/REST";

// Get RxNorm concept properties
const getConceptProperties = async (rxcui) => {
  const data = await apiClient.get(
    `${RXNORM_BASE_URL}/rxcui/${rxcui}/properties.json`
  );

  return data?.properties || null;
};

// Find medicine and identify its RxNorm concept
const findMedicine = async (medicineName) => {
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  const normalizedInput = medicineName.trim();

  // First try exact / normalized RxNorm matching
  const data = await apiClient.get(
    `${RXNORM_BASE_URL}/rxcui.json`,
    {
      name: normalizedInput,
      search: 2,
    }
  );

  const rxcui = data?.idGroup?.rxnormId?.[0];

  if (!rxcui) {
    throw new Error("Medicine not found in RxNorm");
  }

  // Get actual concept properties
  const properties = await getConceptProperties(rxcui);

  if (!properties) {
    throw new Error(
      "Unable to identify medicine in RxNorm"
    );
  }

  const tty = properties.tty || "";
  const rxnormName = properties.name || "";

  // Ingredient-level RxNorm concepts should not be
  // automatically converted into a random product label.
  const isIngredient =
    tty === "IN" ||
    tty === "PIN";

  return {
    rxcui,
    inputName: normalizedInput,

    name: rxnormName,
    synonym: properties.synonym || "",
    tty,

    isIngredient,

    matchType: "exact_or_normalized",
  };
};

module.exports = {
  findMedicine,
};