const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
    {
        // ==================================================
        // User who uploaded the report
        // ==================================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // ==================================================
        // Cloudinary file URL
        // ==================================================

        fileUrl: {
            type: String,
            required: true,
        },

        // ==================================================
        // Cloudinary public ID
        // Used for deleting the file later
        // ==================================================

        publicId: {
            type: String,
            required: true,
        },

        // ==================================================
        // Original uploaded file name
        // ==================================================

        originalName: {
            type: String,
            default: null,
        },

        // ==================================================
        // File type
        // Example:
        // application/pdf
        // image/jpeg
        // image/png
        // ==================================================

        fileType: {
            type: String,
            default: null,
        },

        // ==================================================
        // File size in bytes
        // ==================================================

        fileSize: {
            type: Number,
            default: null,
        },

        // ==================================================
        // Cloudinary resource type
        // Example:
        // image
        // raw
        // video
        // ==================================================

        resourceType: {
            type: String,
            default: "auto",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "MedicalReport",
    medicalReportSchema
);