const prescriptionService = require("../services/prescription.service");
const Prescription = require("../models/Prescription");

const {
  extractPrescriptionMedicines,
} = require("../services/prescription.ocr.service");

const {
  validatePrescriptionMedicines,
} = require("../services/prescription.validation.service");

const {
  analyzePrescriptionMedicines,
} = require("../services/medicine.service");

const searchHistoryService = require("../services/searchHistory.service");

// ==================================================
// Upload prescription
// ==================================================

const uploadPrescription = async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Check uploaded file
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required",
      });
    }

    // --------------------------------------------------
    // 2. Upload image to Cloudinary
    // --------------------------------------------------

    const result =
      await prescriptionService.uploadPrescription(
        req.file
      );

    // --------------------------------------------------
    // 3. Create initial prescription record
    // --------------------------------------------------

    const prescription =
      await Prescription.create({
        userId: req.userId,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,

        prescriptionDetected: false,
        ocrStatus: "pending",
        medicines: [],
      });

    // --------------------------------------------------
    // 4. Gemini OCR
    // --------------------------------------------------

    let ocrResult;

    try {
      ocrResult =
        await extractPrescriptionMedicines(
          req.file.buffer,
          req.file.mimetype
        );
    } catch (ocrError) {
      console.error(
        "Prescription OCR error:",
        ocrError.message
      );

      await Prescription.findByIdAndUpdate(
        prescription._id,
        {
          prescriptionDetected: false,
          ocrStatus: "failed",
        }
      );

      return res.status(201).json({
        success: true,

        message:
          "Prescription uploaded successfully, but OCR processing failed",

        prescription,

        ocr: {
          success: false,
          prescriptionDetected: false,
          medicines: [],
          notes:
            "Prescription uploaded successfully, but text extraction failed.",
        },

        medicineValidation: {
          validatedMedicines: [],
          unrecognizedMedicines: [],
        },
      });
    }

    // --------------------------------------------------
    // 5. Validate OCR medicines using RxNorm
    // --------------------------------------------------

    let validationResult = {
      validatedMedicines: [],
      unrecognizedMedicines: [],
    };

    if (
      ocrResult?.success &&
      ocrResult?.prescriptionDetected &&
      Array.isArray(ocrResult?.medicines) &&
      ocrResult.medicines.length
    ) {
      try {
        validationResult =
          await validatePrescriptionMedicines(
            ocrResult.medicines
          );
      } catch (validationError) {
        console.error(
          "Prescription medicine validation error:",
          validationError.message
        );

        validationResult = {
          validatedMedicines: [],
          unrecognizedMedicines:
            ocrResult.medicines.map(
              (medicine) => ({
                ...medicine,
                validated: false,
              })
            ),
        };
      }
    }

    // --------------------------------------------------
    // 6. Prepare all detected medicines for storage
    // --------------------------------------------------

    const validatedMedicines =
      validationResult.validatedMedicines || [];

    const unrecognizedMedicines =
      validationResult.unrecognizedMedicines || [];

    const unrecognizedForStorage =
      unrecognizedMedicines.map(
        (medicine) => ({
          originalName:
            medicine.name || "",

          normalizedName: "",

          rxcui: null,

          strength:
            medicine.strength || "",

          instructions:
            medicine.instructions || "",

          confidence:
            medicine.confidence || "unknown",

          validated: false,

          unclear:
            Boolean(medicine.unclear),
        })
      );

    // Store BOTH validated and unrecognized medicines
    const allMedicines = [
      ...validatedMedicines,
      ...unrecognizedForStorage,
    ];

    // --------------------------------------------------
    // 7. Save OCR + all medicines in MongoDB
    // --------------------------------------------------

    const savedPrescription =
      await Prescription.findByIdAndUpdate(
        prescription._id,
        {
          prescriptionDetected:
            Boolean(
              ocrResult?.prescriptionDetected
            ),

          ocrStatus:
            ocrResult?.success
              ? "completed"
              : "failed",

          medicines: allMedicines,
        },
        {
          new: true,
        }
      );

    // --------------------------------------------------
    // 8. Return complete result
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Prescription uploaded and processed successfully",

      prescription: savedPrescription,

      ocr: ocrResult,

      medicineValidation: validationResult,
    });
  } catch (error) {
    console.error(
      "Prescription upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload prescription",
    });
  }
};

// ==================================================
// Get logged-in user's prescriptions
// ==================================================

const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions =
      await Prescription.find({
        userId: req.userId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error(
      "Get prescriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};

// ==================================================
// Analyze saved prescription
// ==================================================

const analyzePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const { mode = "normal" } =
      req.body || {};

    // --------------------------------------------------
    // 1. Validate mode
    // --------------------------------------------------

    const responseMode =
      mode?.toLowerCase() === "expert"
        ? "expert"
        : "normal";

    // --------------------------------------------------
    // 2. Find prescription belonging to user
    // --------------------------------------------------

    const prescription =
      await Prescription.findOne({
        _id: id,
        userId: req.userId,
      });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // --------------------------------------------------
    // 3. Get only RxNorm validated medicines
    // --------------------------------------------------

    const validatedMedicines =
      prescription.medicines.filter(
        (medicine) =>
          medicine.validated === true &&
          medicine.rxcui &&
          medicine.normalizedName
      );

    // --------------------------------------------------
    // 4. Check validated medicines
    // --------------------------------------------------

    if (!validatedMedicines.length) {
      return res.status(400).json({
        success: false,
        message:
          "No validated medicines available for analysis",
      });
    }

    // --------------------------------------------------
    // 5. Analyze prescription medicines
    // --------------------------------------------------

    const result =
      await analyzePrescriptionMedicines(
        validatedMedicines,
        responseMode
      );

    // --------------------------------------------------
    // 6. Save prescription analysis to history
    // --------------------------------------------------

    await searchHistoryService.createPrescriptionSearchHistory({
      userId: req.userId,

      prescriptionId:
        prescription._id,

      medicines:
        validatedMedicines,

      riskLevel:
        result?.riskLevel ||
        "Unable to determine",

      mode: responseMode,
    });

    // --------------------------------------------------
    // 7. Return analysis
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Prescription medicine analysis completed successfully",

      prescriptionId:
        prescription._id,

      mode: responseMode,

      data: result,
    });
  } catch (error) {
    console.error(
      "Prescription analysis error:"
    );

    console.error(
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to analyze prescription",
    });
  }
};

// ==================================================
// Delete prescription
// ==================================================

const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Find prescription belonging to logged-in user
    const prescription =
      await Prescription.findOne({
        _id: id,
        userId: req.userId,
      });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Delete image from Cloudinary
    if (prescription.publicId) {
      await prescriptionService.deletePrescription(
        prescription.publicId
      );
    }

    // Delete MongoDB record
    await Prescription.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Prescription deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete prescription",
    });
  }
};

// ==================================================
// Exports
// ==================================================

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  analyzePrescription,
  deletePrescription,
};