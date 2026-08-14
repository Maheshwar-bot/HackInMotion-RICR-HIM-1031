const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  uploadMedicalReport,
  getMyMedicalReports,
  deleteMedicalReport,
} = require("../controllers/medicalReport.controller");

// ==================================================
// Upload Medical Report
// ==================================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("report"),
  uploadMedicalReport
);

// ==================================================
// Get Logged-in User's Medical Reports
// ==================================================

router.get(
  "/",
  authMiddleware,
  getMyMedicalReports
);

// ==================================================
// Delete Medical Report
// ==================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteMedicalReport
);

module.exports = router;