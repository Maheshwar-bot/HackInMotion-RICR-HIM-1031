const mongoose = require("mongoose");

const prescriptionMedicineSchema = new mongoose.Schema(
  {
    // Medicine name detected by Gemini OCR
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    // Normalized medicine name
    normalizedName: {
      type: String,
      default: "",
      trim: true,
    },

    // RxNorm identifier
    rxcui: {
      type: String,
      default: null,
    },

    // Strength detected from prescription
    strength: {
      type: String,
      default: "",
    },

    // Instructions detected from prescription
    instructions: {
      type: String,
      default: "",
    },

    // Gemini OCR confidence
    confidence: {
      type: String,
      enum: [
        "high",
        "medium",
        "low",
        "unknown",
      ],
      default: "unknown",
    },

    // Whether RxNorm successfully validated it
    validated: {
      type: Boolean,
      default: false,
    },

    // OCR could not clearly understand the medicine
    unclear: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const prescriptionSchema = new mongoose.Schema(
  {
    // User who uploaded the prescription
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Uploaded prescription image URL
    imageUrl: {
      type: String,
      required: true,
    },

    // Storage provider file ID
    publicId: {
      type: String,
      default: null,
    },

    // Optional original file name
    originalName: {
      type: String,
      default: null,
    },

    // Medicines extracted and validated from prescription
    medicines: {
      type: [prescriptionMedicineSchema],
      default: [],
    },

    // Whether Gemini successfully detected a prescription
    prescriptionDetected: {
      type: Boolean,
      default: false,
    },

    // OCR processing status
    ocrStatus: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Prescription",
  prescriptionSchema
);