const allergyService = require("../services/allergy.service");

// ======================================================
// CREATE ALLERGY
// ======================================================

const createAllergy = async (req, res) => {
  try {
    const { allergyName, notes } = req.body;

    if (!allergyName || !allergyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Allergy name is required",
      });
    }

    const allergy =
      await allergyService.createAllergy(
        req.userId,
        {
          allergyName,
          notes,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Allergy added successfully",
      allergy,
    });
  } catch (error) {
    console.error(
      "CREATE ALLERGY ERROR:",
      error
    );

    if (error.message === "Allergy already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to add allergy",
    });
  }
};

// ======================================================
// GET USER ALLERGIES
// ======================================================

const getUserAllergies = async (req, res) => {
  try {
    const allergies =
      await allergyService.getUserAllergies(
        req.userId
      );

    return res.status(200).json({
      success: true,
      allergies,
    });
  } catch (error) {
    console.error(
      "GET ALLERGIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch allergies",
    });
  }
};

// ======================================================
// UPDATE ALLERGY
// ======================================================

const updateAllergy = async (req, res) => {
  try {
    const { allergyId } = req.params;

    const allergy =
      await allergyService.updateAllergy(
        req.userId,
        allergyId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Allergy updated successfully",
      allergy,
    });
  } catch (error) {
    console.error(
      "UPDATE ALLERGY ERROR:",
      error
    );

    if (error.message === "Allergy not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update allergy",
    });
  }
};

// ======================================================
// DELETE ALLERGY
// ======================================================

const deleteAllergy = async (req, res) => {
  try {
    const { allergyId } = req.params;

    await allergyService.deleteAllergy(
      req.userId,
      allergyId
    );

    return res.status(200).json({
      success: true,
      message: "Allergy deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ALLERGY ERROR:",
      error
    );

    if (error.message === "Allergy not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete allergy",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createAllergy,
  getUserAllergies,
  updateAllergy,
  deleteAllergy,
};