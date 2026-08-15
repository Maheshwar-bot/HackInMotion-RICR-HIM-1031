const express = require("express");

const {
  analyzeMedicine,
} = require("../controllers/medicine.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Analyze two medicines - protected route
router.post(
  "/analyze",
  authMiddleware,
  analyzeMedicine
);

module.exports = router;