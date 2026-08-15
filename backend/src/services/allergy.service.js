const Allergy = require("../models/Allergy");

// ======================================================
// ADD ALLERGY
// ======================================================

const createAllergy = async (userId, allergyData) => {
  const { allergyName, notes } = allergyData;

  // Prevent duplicate allergy for the same user
  const existingAllergy = await Allergy.findOne({
    userId,
    allergyName: {
      $regex: `^${allergyName.trim()}$`,
      $options: "i",
    },
  });

  if (existingAllergy) {
    throw new Error("Allergy already exists");
  }

  const allergy = await Allergy.create({
    userId,
    allergyName,
    notes: notes || "",
  });

  return allergy;
};

// ======================================================
// GET USER ALLERGIES
// ======================================================

const getUserAllergies = async (userId) => {
  const allergies = await Allergy.find({
    userId,
  }).sort({
    createdAt: -1,
  });

  return allergies;
};

// ======================================================
// UPDATE ALLERGY
// ======================================================

const updateAllergy = async (
  userId,
  allergyId,
  updateData
) => {
  const allergy = await Allergy.findOneAndUpdate(
    {
      _id: allergyId,
      userId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!allergy) {
    throw new Error("Allergy not found");
  }

  return allergy;
};

// ======================================================
// DELETE ALLERGY
// ======================================================

const deleteAllergy = async (
  userId,
  allergyId
) => {
  const allergy = await Allergy.findOneAndDelete({
    _id: allergyId,
    userId,
  });

  if (!allergy) {
    throw new Error("Allergy not found");
  }

  return allergy;
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