// Medicine controller

const medicineService = require("../services/medicine.service");

// Analyze medicine from user input
const analyzeMedicine = async (req, res) => {
  try {
    const { medicineName } = req.body;

    // Analyze medicine using backend services
    const result = await medicineService.analyzeMedicine(
      medicineName
    );

    return res.status(200).json({
      success: true,
      message: "Medicine identified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  analyzeMedicine,
};