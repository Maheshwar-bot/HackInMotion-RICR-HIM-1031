const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Prescription",
  prescriptionSchema
);