const cloudinary = require("../config/cloudinary");

// ==================================================
// Upload Medical Report
// ==================================================

const uploadMedicalReport = async (file) => {
  if (!file) {
    throw new Error(
      "Medical report file is required"
    );
  }

  // Convert uploaded file buffer to data URI
  const fileData = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const result =
    await cloudinary.uploader.upload(
      fileData,
      {
        folder: "medimitra/reports",
        resource_type: "auto",
      }
    );

  return result;
};

// ==================================================
// Delete Medical Report
// ==================================================

const deleteMedicalReport = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType,
    }
  );
};

module.exports = {
  uploadMedicalReport,
  deleteMedicalReport,
};