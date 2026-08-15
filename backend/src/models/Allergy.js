const mongoose = require("mongoose");

const allergySchema = new mongoose.Schema(
  {
    // Logged-in user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Allergy name
    allergyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Optional additional note
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Allergy",
  allergySchema
);