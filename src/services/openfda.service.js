// FDA safety data service

const apiClient = require("../utils/apiClient");

// openFDA Drug Label API
const OPENFDA_BASE_URL =
  process.env.OPENFDA_BASE_URL ||
  "https://api.fda.gov/drug/label.json";

// Get safety information for a medicine
const getSafetyData = async (medicineName) => {
  // Validate medicine input
  if (!medicineName || !medicineName.trim()) {
    throw new Error("Medicine name is required");
  }

  const normalizedName = medicineName.trim();

  // Search FDA label using generic or brand name
  const data = await apiClient.get(
    OPENFDA_BASE_URL,
    {
      search:
        `openfda.generic_name:"${normalizedName}" OR ` +
        `openfda.brand_name:"${normalizedName}"`,
      limit: 5,
    }
  );

  // Extract FDA records
  const records = data?.results || [];

  // Return empty result if no data found
  if (!records.length) {
    return {
      found: false,
      records: [],
    };
  }

  // Return FDA safety records
  return {
    found: true,
    records,
  };
};

module.exports = {
  getSafetyData,
};