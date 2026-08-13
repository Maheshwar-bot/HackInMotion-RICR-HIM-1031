const prescriptionService = require("../services/prescription.service");
const Prescription = require("../models/Prescription");

const uploadPrescription = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required",
      });
    }

    // Upload prescription to Cloudinary
    const result = await prescriptionService.uploadPrescription(
      req.file
    );

    // Save prescription details in MongoDB
    const prescription = await Prescription.create({
      userId: req.userId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
    });

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully",
      prescription,
    });
  } catch (error) {
    console.error("Prescription upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload prescription",
    });
  }
};

module.exports = {
  uploadPrescription,
};