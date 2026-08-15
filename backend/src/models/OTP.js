const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        otp: {
            type: String,
            required: true,
        },

        purpose: {
            type: String,
            enum: ["signup", "forgot-password"],
            required: true,
        },

        name: {
            type: String,
            default: null,
        },

        passwordHash: {
            type: String,
            default: null,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        // Track last OTP send time for resend cooldown
        lastSentAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("OTP", otpSchema);