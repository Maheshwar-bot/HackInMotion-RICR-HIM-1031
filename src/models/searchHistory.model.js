const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    // ==================================================
    // User
    // ==================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==================================================
    // Medicines
    // ==================================================

    // First medicine
    medicine1: {
      type: String,
      trim: true,
      default: null,
    },

    // Second medicine
    // Optional for prescription analysis
    medicine2: {
      type: String,
      trim: true,
      default: null,
    },

    // ==================================================
    // Analysis Source
    // ==================================================

    source: {
      type: String,
      enum: [
        "manual",
        "prescription",
      ],
      default: "manual",
      index: true,
    },

    // ==================================================
    // Prescription Reference
    // ==================================================

    // Filled only when source = prescription
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
      index: true,
    },

    // ==================================================
    // Risk Level
    // ==================================================

    riskLevel: {
      type: String,
      enum: [
        "Low",
        "Moderate",
        "High",
        "Critical",
        "Unable to determine",
      ],
      default: "Unable to determine",
    },

    // ==================================================
    // Response Mode
    // ==================================================

    mode: {
      type: String,
      enum: [
        "normal",
        "expert",
      ],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SearchHistory",
  searchHistorySchema
);