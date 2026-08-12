const axios = require("axios");

// Common GET request helper for JSON APIs
const get = async (url, params = {}) => {
  try {
    const response = await axios.get(url, {
      params,
      timeout: 15000,
      headers: {
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    // Show external API error during development
    console.error("API URL:", url);
    console.error("API Status:", error.response?.status);
    console.error("API Error:", error.response?.data || error.message);

    throw new Error(
      "Medicine data service is temporarily unavailable"
    );
  }
};

// GET helper for XML responses
const getText = async (url, params = {}) => {
  try {
    // Build query string
    const query = new URLSearchParams(params).toString();

    const finalUrl = query
      ? `${url}?${query}`
      : url;

    // Fetch XML from DailyMed
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        Accept: "application/xml, text/xml, */*",
        "User-Agent": "MediMitra/1.0",
      },
    });

    // Check response status
    if (!response.ok) {
      throw new Error(
        `DailyMed returned HTTP ${response.status}`
      );
    }

    // Read XML as text
    const xmlData = await response.text();

    return xmlData;
  } catch (error) {
    // Show exact error for debugging
    console.error("DAILYMED XML ERROR:", error);

    throw new Error(
      `DailyMed XML error: ${error.message}`
    );
  }
};

module.exports = {
  get,
  getText,
};