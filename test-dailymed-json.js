// Temporary DailyMed JSON connection test

const url =
  "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxcui=18631&pagesize=5&page=1";

const testDailyMedJSON = async () => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MediMitra/1.0",
      },
    });

    console.log("Status:", response.status);
    console.log(
      "Content-Type:",
      response.headers.get("content-type")
    );

    const text = await response.text();

    console.log("Response length:", text.length);
    console.log("Response starts with:");
    console.log(text.substring(0, 500));
  } catch (error) {
    console.error("Node DailyMed JSON error:", error);
  }
};

testDailyMedJSON();