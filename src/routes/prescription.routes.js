const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  uploadPrescription,
  getMyPrescriptions,
  analyzePrescription,
  deletePrescription,
} = require("../controllers/prescription.controller");

// Upload prescription
router.post(
  "/upload",
  authMiddleware,
  uploadPrescription
);

// Get logged-in user's prescriptions
router.get(
  "/",
  authMiddleware,
  getMyPrescriptions
);

// Analyze saved prescription
router.post(
  "/:id/analyze",
  authMiddleware,
  analyzePrescription
);

// Delete prescription
router.delete(
  "/:id",
  authMiddleware,
  deletePrescription
);

module.exports = router;