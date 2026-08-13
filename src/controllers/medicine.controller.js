// Medicine controller

const medicineService = require("../services/medicine.service");
const searchHistoryService = require("../services/searchHistory.service");

// Analyze two medicines from user input
const analyzeMedicine = async (req, res) => {
  try {
    const {
      medicineName1,
      medicineName2,
      mode = "normal",
    } = req.body;

    // User must be authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate mode
    const selectedMode =
      mode?.toLowerCase() === "expert"
        ? "expert"
        : "normal";

    // Analyze both medicines
    const result =
      await medicineService.analyzeMedicine(
        medicineName1,
        medicineName2,
        selectedMode
      );

    // Get risk level from structured service response
    const riskLevel =
      result?.riskLevel ||
      "Unable to determine";

    // Save successful analysis to search history
    await searchHistoryService.createSearchHistory({
      userId: req.userId,
      medicine1: medicineName1.trim(),
      medicine2: medicineName2.trim(),
      riskLevel,
      mode: selectedMode,
    });

    return res.status(200).json({
      success: true,
      message:
        "Medicine interaction analysis completed successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "MEDICINE CONTROLLER ERROR:"
    );
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  analyzeMedicine,
};