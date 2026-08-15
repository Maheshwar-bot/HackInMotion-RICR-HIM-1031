const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// ======================================================
// GET PROFILE
// ======================================================

const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "-password"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ======================================================
// UPLOAD PROFILE IMAGE
// ======================================================

const uploadProfileImage = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "medimitra/profiles",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    uploadStream.end(file.buffer);
  });
};

// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (
  userId,
  profileData
) => {
  const allowedUpdates = {};

  if (profileData.name !== undefined) {
    allowedUpdates.name =
      profileData.name.trim();
  }

  if (profileData.age !== undefined) {
    allowedUpdates.age = profileData.age;
  }

  if (profileData.bloodGroup !== undefined) {
    allowedUpdates.bloodGroup =
      profileData.bloodGroup;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    allowedUpdates,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ======================================================
// UPDATE PROFILE IMAGE
// ======================================================

const updateProfileImage = async (
  userId,
  imageUrl
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      profileImage: imageUrl,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  uploadProfileImage,
};