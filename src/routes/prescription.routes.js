const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  uploadPrescription,
} = require("../controllers/prescription.controller");

// Upload prescription
router.post(
  "/upload",
  authMiddleware,
  upload.single("prescription"),
  uploadPrescription
);

module.exports = router;