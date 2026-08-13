const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    medicine1: {
      type: String,
      required: true,
      trim: true,
    },

    medicine2: {
      type: String,
      required: true,
      trim: true,
    },

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

    mode: {
      type: String,
      enum: ["normal", "expert"],
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