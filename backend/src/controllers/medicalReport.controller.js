const medicalReportService = require("../services/medicalReport.service");
const MedicalReport = require("../models/MedicalReport");

// ==================================================
// Upload Medical Report
// ==================================================

const uploadMedicalReport = async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Authentication check
    // --------------------------------------------------

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // 2. Check uploaded file
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Medical report file is required",
      });
    }

    // --------------------------------------------------
    // 3. Upload file to Cloudinary
    // --------------------------------------------------

    const result =
      await medicalReportService.uploadMedicalReport(
        req.file
      );

    // --------------------------------------------------
    // 4. Save report metadata in MongoDB
    // --------------------------------------------------

    const report = await MedicalReport.create({
      userId: req.userId,

      fileUrl: result.secure_url,

      publicId: result.public_id,

      originalName: req.file.originalname,

      fileType: req.file.mimetype,

      fileSize: req.file.size,

      resourceType: result.resource_type || "image",
    });

    // --------------------------------------------------
    // 5. Return successful response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Medical report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error(
      "MEDICAL REPORT UPLOAD ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload medical report",
    });
  }
};

// ==================================================
// Get Logged-in User's Medical Reports
// ==================================================

const getMyMedicalReports = async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Authentication check
    // --------------------------------------------------

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // 2. Get only current user's reports
    // --------------------------------------------------

    const reports = await MedicalReport.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    // --------------------------------------------------
    // 3. Return reports
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Medical reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error(
      "MEDICAL REPORT FETCH ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical reports",
    });
  }
};

// ==================================================
// Delete Medical Report
// ==================================================

const deleteMedicalReport = async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Authentication check
    // --------------------------------------------------

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    // --------------------------------------------------
    // 2. Find report belonging to current user
    // --------------------------------------------------

    const report = await MedicalReport.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Medical report not found",
      });
    }

    // --------------------------------------------------
    // 3. Delete file from Cloudinary
    // --------------------------------------------------

    if (report.publicId) {
      await medicalReportService.deleteMedicalReport(
        report.publicId,
        report.resourceType || "image"
      );
    }

    // --------------------------------------------------
    // 4. Delete MongoDB record
    // --------------------------------------------------

    await MedicalReport.findByIdAndDelete(id);

    // --------------------------------------------------
    // 5. Return success
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Medical report deleted successfully",
    });
  } catch (error) {
    console.error(
      "MEDICAL REPORT DELETE ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete medical report",
    });
  }
};

// ==================================================
// Exports
// ==================================================

module.exports = {
  uploadMedicalReport,
  getMyMedicalReports,
  deleteMedicalReport,
};