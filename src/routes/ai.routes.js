const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  chat,
  getChatHistory,
} = require("../controllers/ai.controller");

const router = express.Router();


// ======================================================
// AI Doctor Chat
// ======================================================

router.post(
  "/chat",
  authMiddleware,
  chat
);


// ======================================================
// Get AI Doctor Chat History
// ======================================================

router.get(
  "/chat/history",
  authMiddleware,
  getChatHistory,
);


module.exports = router;