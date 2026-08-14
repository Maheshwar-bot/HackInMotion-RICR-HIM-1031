const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    // Logged-in user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Medicine name
    medicineName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Daily reminder time in HH:mm format
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    // Reminder frequency
    frequency: {
      type: String,
      enum: ["daily"],
      default: "daily",
    },

    // Can be turned off without deleting
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Reminder",
  reminderSchema
);