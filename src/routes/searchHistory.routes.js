const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  getSearchHistory,
} = require("../controllers/searchHistory.controller");

const router = express.Router();

// Get logged-in user's search history
router.get(
  "/",
  authMiddleware,
  getSearchHistory
);

module.exports = router;