const axios = require("axios");

// Common GET request helper for medicine APIs
const get = async (url, params = {}) => {
  try {
    const response = await axios.get(url, {
      params,
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    // Keep external API errors controlled
    console.error(
      "External API error:",
      error.response?.status || error.message
    );

    throw new Error("Medicine data service is temporarily unavailable");
  }
};

module.exports = {
  get,
};