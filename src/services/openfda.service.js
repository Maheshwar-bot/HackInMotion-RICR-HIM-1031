// FDA safety data service

const apiClient = require("../utils/apiClient");

// openFDA Drug Label API
const OPENFDA_BASE_URL =
  process.env.OPENFDA_BASE_URL ||
  "https://api.fda.gov/drug/label.json";

// Search openFDA using RxCUI
const searchByRxCui = async (rxcui) => {
  try {
    const data = await apiClient.get(
      OPENFDA_BASE_URL,
      {
        search: `openfda.rxcui:"${rxcui}"`,
        limit: 5,
      }
    );

    return data?.results || [];
  } catch (error) {
    // 404 means no matching FDA record
    if (error?.status === 404) {
      return [];
    }

    throw error;
  }
};

// Search openFDA using the official RxNorm medicine name
const searchByRxNormName = async (rxnormName) => {
  try {
    const data = await apiClient.get(
      OPENFDA_BASE_URL,
      {
        search:
          `openfda.generic_name:"${rxnormName}" OR ` +
          `openfda.brand_name:"${rxnormName}" OR ` +
          `openfda.active_ingredient:"${rxnormName}"`,
        limit: 5,
      }
    );

    return data?.results || [];
  } catch (error) {
    // 404 means no matching FDA record
    if (error?.status === 404) {
      return [];
    }

    throw error;
  }
};

// Search openFDA using original medicine name
const searchByName = async (medicineName) => {
  try {
    const data = await apiClient.get(
      OPENFDA_BASE_URL,
      {
        search:
          `openfda.generic_name:"${medicineName}" OR ` +
          `openfda.brand_name:"${medicineName}" OR ` +
          `openfda.active_ingredient:"${medicineName}"`,
        limit: 5,
      }
    );

    return data?.results || [];
  } catch (error) {
    // 404 means no matching FDA record
    if (error?.status === 404) {
      return [];
    }

    throw error;
  }
};

// Get safety information for a medicine
const getSafetyData = async (
  medicineName,
  rxnormData = {}
) => {
  // Validate medicine input
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  const normalizedName = medicineName.trim();

  let records = [];

  // --------------------------------------------------
  // 1. Try RxCUI first
  // --------------------------------------------------
  if (rxnormData?.rxcui) {
    console.log(
      `OPENFDA: Searching by RxCUI ${rxnormData.rxcui}`
    );

    records = await searchByRxCui(
      rxnormData.rxcui
    );
  }

  // --------------------------------------------------
  // 2. Try official RxNorm name
  // --------------------------------------------------
  if (
    !records.length &&
    rxnormData?.name
  ) {
    console.log(
      `OPENFDA: Searching by RxNorm name "${rxnormData.name}"`
    );

    records = await searchByRxNormName(
      rxnormData.name
    );
  }

  // --------------------------------------------------
  // 3. Fallback to original user input
  // --------------------------------------------------
  if (!records.length) {
    console.log(
      `OPENFDA: Falling back to original name "${normalizedName}"`
    );

    records = await searchByName(
      normalizedName
    );
  }

  // --------------------------------------------------
  // 4. No FDA data
  // --------------------------------------------------
  if (!records.length) {
    console.warn(
      `OPENFDA: No safety data found for "${normalizedName}"`
    );

    return {
      found: false,
      records: [],
      source: "openFDA",
    };
  }

  // --------------------------------------------------
  // 5. FDA data found
  // --------------------------------------------------
  return {
    found: true,
    records,
    source: "openFDA",
  };
};

module.exports = {
  getSafetyData,
};