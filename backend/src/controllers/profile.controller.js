const profileService = require("../services/profile.service");

// ======================================================
// GET PROFILE
// ======================================================

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(
      req.userId
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch profile",
    });
  }
};

// ======================================================
// UPDATE PROFILE
// Name / Age / Blood Group
// ======================================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      bloodGroup,
    } = req.body;

    if (
      name === undefined &&
      age === undefined &&
      bloodGroup === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one profile field is required",
      });
    }

    // Validate name
    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length < 2
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters",
      });
    }

    // Validate age
    if (
      age !== undefined &&
      age !== null
    ) {
      const numericAge = Number(age);

      if (
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Age must be a whole number between 1 and 120",
        });
      }
    }

    const user =
      await profileService.updateProfile(
        req.userId,
        {
          name,
          age,
          bloodGroup,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update profile",
    });
  }
};

// ======================================================
// UPLOAD PROFILE IMAGE
// ======================================================

const uploadProfileImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Profile image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadResult =
      await profileService.uploadProfileImage(
        req.file
      );

    // Save Cloudinary URL
    // inside logged-in user's profile
    const user =
      await profileService.updateProfileImage(
        req.userId,
        uploadResult.secure_url
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile image updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "UPLOAD PROFILE IMAGE ERROR:",
      error
    );

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload profile image",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
};