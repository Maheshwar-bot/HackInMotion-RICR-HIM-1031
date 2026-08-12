const express = require("express");

const {
  analyzeMedicine,
} = require("../controllers/medicine.controller");

const router = express.Router();

// Analyze medicine name
router.post("/analyze", analyzeMedicine);

module.exports = router;