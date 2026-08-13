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

  try {
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

    // No matching records
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
  } catch (error) {
    // openFDA returns 404 when no matching records are found.
    // This should not stop the complete medicine analysis.
    if (error?.status === 404) {
      console.warn(
        `openFDA: No label data found for "${normalizedName}"`
      );

      return {
        found: false,
        records: [],
      };
    }

    // Actual API/network/server error
    console.error("OPENFDA SERVICE ERROR:");
    console.error("Medicine:", normalizedName);
    console.error("Status:", error?.status);
    console.error("Message:", error.message);

    throw error;
  }
};

module.exports = {
  getSafetyData,
};