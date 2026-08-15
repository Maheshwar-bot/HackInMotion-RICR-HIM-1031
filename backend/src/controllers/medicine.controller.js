// Medicine controller

const medicineService = require("../services/medicine.service");
const searchHistoryService = require("../services/searchHistory.service");

// ==================================================
// Analyze two medicines from user input
// ==================================================

const analyzeMedicine = async (req, res) => {
  try {
    const {
  medicineName1,
  medicineName2,
  mode = "normal",
  language = "English",
} = req.body;

    // --------------------------------------------------
    // 1. User must be authenticated
    // --------------------------------------------------

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // 2. Validate mode
    // --------------------------------------------------

    const selectedMode =
      mode?.toLowerCase() === "expert"
        ? "expert"
        : "normal";

    // --------------------------------------------------
    // 3. Analyze both medicines
    // --------------------------------------------------

    const result =
  await medicineService.analyzeMedicine(
    medicineName1,
    medicineName2,
    selectedMode,
    language
  );

    // --------------------------------------------------
    // 4. Get structured risk level
    // --------------------------------------------------

    const riskLevel =
      result?.riskLevel ||
      "Unable to determine";

    // --------------------------------------------------
    // 5. Save successful manual analysis
    // --------------------------------------------------

    await searchHistoryService.createSearchHistory({
      userId: req.userId,

      medicine1:
        medicineName1?.trim() || null,

      medicine2:
        medicineName2?.trim() || null,

      riskLevel,

      mode: selectedMode,

      source: "manual",

      prescriptionId: null,
    });

    // --------------------------------------------------
    // 6. Return analysis result
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Medicine interaction analysis completed successfully",

      data: result,
    });
 } catch (error) {
  console.error("MEDICINE CONTROLLER ERROR:");
  console.error("Name:", error.name);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);

  if (error.status) {
    console.error("Status:", error.status);
  }

  if (error.response?.data) {
    console.error(
      "Response Data:",
      error.response.data
    );
  }

  return res.status(400).json({
    success: false,
    message: error.message,
  });
}
};

module.exports = {
  analyzeMedicine,
};