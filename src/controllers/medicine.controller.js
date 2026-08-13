// Medicine controller

const medicineService = require("../services/medicine.service");

// Analyze two medicines from user input
const analyzeMedicine = async (req, res) => {
  try {
    const { medicineName1, medicineName2 } = req.body;

    // Analyze both medicines
    const result = await medicineService.analyzeMedicine(
      medicineName1,
      medicineName2
    );

    return res.status(200).json({
      success: true,
      message: "Medicine interaction analysis completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("MEDICINE CONTROLLER ERROR:");
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