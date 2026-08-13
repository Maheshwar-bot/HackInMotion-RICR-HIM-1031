const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  uploadPrescription,
  getMyPrescriptions,
  deletePrescription,
} = require("../controllers/prescription.controller");


// Upload prescription
router.post(
  "/upload",
  authMiddleware,
  upload.single("prescription"),
  uploadPrescription
);


// Get logged-in user's prescriptions
router.get(
  "/",
  authMiddleware,
  getMyPrescriptions
);


// Delete prescription
router.delete(
  "/:id",
  authMiddleware,
  deletePrescription
);


module.exports = router;