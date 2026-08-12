// DailyMed drug information service

const { XMLParser } = require("fast-xml-parser");

// DailyMed API base URL
const DAILYMED_BASE_URL =
  process.env.DAILYMED_BASE_URL ||
  "https://dailymed.nlm.nih.gov/dailymed/services/v2";

// Parse XML into JavaScript object
const parseXML = (xmlData) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    trimValues: true,
  });

  return parser.parse(xmlData);
};

// Get JSON data from DailyMed
const getDailyMedJSON = async (url, params = {}) => {
  // Build query string
  const query = new URLSearchParams(params).toString();

  const finalUrl = query
    ? `${url}?${query}`
    : url;

  // Debug: show exact URL being requested
  console.log("DAILYMED JSON URL:", finalUrl);

  // Request DailyMed JSON
  const response = await fetch(finalUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "MediMitra/1.0",
    },
  });

  // Debug: show response status
  console.log(
    "DAILYMED JSON STATUS:",
    response.status
  );

  // Read response as text first
  const responseText = await response.text();

  // Debug: show first part of response
  console.log(
    "DAILYMED JSON RESPONSE:",
    responseText.substring(0, 500)
  );

  // Check API response
  if (!response.ok) {
    throw new Error(
      `DailyMed JSON request failed with status code ${response.status}`
    );
  }

  // Convert JSON text into JavaScript object
  return JSON.parse(responseText);
};

// Get XML data from DailyMed
const getDailyMedXML = async (url) => {
  // Debug: show XML URL
  console.log("DAILYMED XML URL:", url);

  // Request XML
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/xml, text/xml, */*",
      "User-Agent": "MediMitra/1.0",
    },
  });

  // Debug: show XML status
  console.log(
    "DAILYMED XML STATUS:",
    response.status
  );

  // Read XML as text
  const xmlData = await response.text();

  // Debug: show XML size
  console.log(
    "DAILYMED XML LENGTH:",
    xmlData.length
  );

  // Check API response
  if (!response.ok) {
    throw new Error(
      `DailyMed XML request failed with status code ${response.status}`
    );
  }

  return xmlData;
};

// Get drug information using RxCUI
const getDrugInfo = async (rxcui) => {
  // Find labels linked to RxCUI
  const listData = await getDailyMedJSON(
    `${DAILYMED_BASE_URL}/spls.json`,
    {
      rxcui,
      pagesize: 5,
      page: 1,
    }
  );

  // Extract available labels
  const records = listData?.data || [];

  console.log(
    "DAILYMED LABEL COUNT:",
    records.length
  );

  if (!records.length) {
    return {
      found: false,
      label: null,
    };
  }

  // Try available labels one by one
  for (const record of records) {
    try {
      // Build XML URL
      const xmlUrl =
        `${DAILYMED_BASE_URL}/spls/${record.setid}.xml`;

      // Fetch XML
      const xmlData =
        await getDailyMedXML(xmlUrl);

      // Convert XML into JavaScript object
      const labelData =
        parseXML(xmlData);

      // Return successfully parsed label
      return {
        found: true,

        label: {
          setid: record.setid,
          title: record.title,
          publishedDate: record.published_date,

          // Parsed DailyMed XML
          data: labelData,
        },
      };
    } catch (error) {
      // Try next label if current one fails
      console.warn(
        `DailyMed label failed: ${record.setid}`
      );

      console.warn(
        "Reason:",
        error.message
      );
    }
  }

  // No valid label found
  throw new Error(
    "Unable to retrieve a valid DailyMed drug label"
  );
};

module.exports = {
  getDrugInfo,
};