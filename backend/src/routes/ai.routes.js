const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  chat,
  getChatHistory,
  getAllChats,
  getChatById,
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

// ======================================================
// Get All AI Doctor Chats
// ======================================================

router.get(
  "/chats",
  authMiddleware,
  getAllChats
);


// ======================================================
// Get Specific AI Doctor Chat
// ======================================================

router.get(
  "/chats/:chatId",
  authMiddleware,
  getChatById
);


module.exports = router;