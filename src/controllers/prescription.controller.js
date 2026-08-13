const prescriptionService = require("../services/prescription.service");
const Prescription = require("../models/Prescription");


// Upload prescription
const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required",
      });
    }

    const result = await prescriptionService.uploadPrescription(
      req.file
    );

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


// Get logged-in user's prescriptions
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};


// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Find prescription belonging to logged-in user
    const prescription = await Prescription.findOne({
      _id: id,
      userId: req.userId,
    });

    // Prescription not found or belongs to another user
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Delete file from Cloudinary
    if (prescription.publicId) {
      await prescriptionService.deletePrescription(
        prescription.publicId
      );
    }

    // Delete record from MongoDB
    await Prescription.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
    });
  }
};


module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  deletePrescription,
};