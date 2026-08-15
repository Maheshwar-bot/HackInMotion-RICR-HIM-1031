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

// Get drug information using RxCUI and RxNorm identity
const getDrugInfo = async (
  rxcui,
  medicineIdentity = {}
) => {
  const {
    name = "",
    synonym = "",
    inputName = "",
    isIngredient = false,
  } = medicineIdentity;

  /*
   * IMPORTANT:
   * If the user supplied only an ingredient-level medicine
   * such as "Paracetamol", do not randomly select a
   * combination/product label from DailyMed.
   */
  if (isIngredient) {
    console.log(
      `DAILYMED: "${inputName}" identified as an ingredient.`
    );

    console.log(
      "DAILYMED: Skipping automatic product-label selection."
    );

    return {
      found: false,
      label: null,

      reason:
        "Ingredient-level medicine input. Product-specific DailyMed label was not selected automatically.",
    };
  }

  // Search DailyMed for a specific product/clinical drug
  const listData = await getDailyMedJSON(
    `${DAILYMED_BASE_URL}/spls.json`,
    {
      rxcui,
      pagesize: 5,
      page: 1,
    }
  );

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

  const targetNames = [
    inputName,
    name,
    synonym,
  ]
    .filter(Boolean)
    .map((value) =>
      value.toLowerCase().trim()
    );

  /*
   * Score labels using the actual medicine identity.
   * Never blindly select records[0].
   */
  const scoredRecords = records.map((record) => {
    const title = (
      record.title || ""
    ).toLowerCase();

    let score = 0;

    targetNames.forEach((target) => {
      if (target && title.includes(target)) {
        score += 3;
      }
    });

    return {
      record,
      score,
      publishedDate:
        record.published_date || "",
    };
  });

  scoredRecords.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return (
      new Date(b.publishedDate || 0) -
      new Date(a.publishedDate || 0)
    );
  });

  /*
   * Only accept a label when there is actual evidence
   * that it matches the requested medicine identity.
   */
  const relevantRecords =
    scoredRecords.filter(
      (item) => item.score > 0
    );

  if (!relevantRecords.length) {
    console.warn(
      `DAILYMED: No confidently matching label found for "${inputName}".`
    );

    return {
      found: false,
      label: null,
      reason:
        "No confidently matching DailyMed product label found.",
    };
  }

 // Try only the top 2 relevant labels.
// This prevents multiple sequential XML requests
// while keeping a fallback if the best label fails.
const topRelevantRecords =
  relevantRecords.slice(0, 2);

for (const item of topRelevantRecords) {
  const record = item.record;

  try {
    const xmlUrl =
      `${DAILYMED_BASE_URL}/spls/${record.setid}.xml`;

    const xmlData =
      await getDailyMedXML(xmlUrl);

    const labelData =
      parseXML(xmlData);

    return {
      found: true,

      label: {
        setid: record.setid,
        title: record.title,
        publishedDate:
          record.published_date,

        relevanceScore: item.score,

        data: labelData,
      },
    };
  } catch (error) {
    console.warn(
      `DailyMed label failed: ${record.setid}`
    );

    console.warn(
      "Reason:",
      error.message
    );
  }
}

  return {
    found: false,
    label: null,
    reason:
      "Unable to retrieve a valid matching DailyMed label.",
  };
};

module.exports = {
  getDrugInfo,
};