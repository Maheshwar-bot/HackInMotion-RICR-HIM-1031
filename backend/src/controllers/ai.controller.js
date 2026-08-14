// ======================================================
// AI CHAT CONTROLLER
// ======================================================

const {
  chatWithAI,
} = require("../services/ai.service");

const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

// ======================================================
// AI Doctor Chat
// ======================================================

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    // --------------------------------------------------
    // Validate message
    // --------------------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // --------------------------------------------------
    // Get logged-in user
    // --------------------------------------------------

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // Find user's latest chat
    // --------------------------------------------------

    let chat = await Chat.findOne({
      userId,
    }).sort({
      updatedAt: -1,
    });

    // --------------------------------------------------
    // Create chat if user has no previous chat
    // --------------------------------------------------

    if (!chat) {
      chat = await Chat.create({
        userId,
        title: "AI Doctor Chat",
      });
    }

    // --------------------------------------------------
    // Save user message
    // --------------------------------------------------

    await Message.create({
      chatId: chat._id,
      userId,
      role: "user",
      content: message.trim(),
    });

    // --------------------------------------------------
    // Send message to AI service
    // --------------------------------------------------

    const result = await chatWithAI(message.trim());

    // --------------------------------------------------
    // Get AI answer
    // --------------------------------------------------

    const answer =
      result?.answer ||
      "Sorry, I couldn't generate an answer.";

    // --------------------------------------------------
    // Save AI response
    // --------------------------------------------------

    await Message.create({
      chatId: chat._id,
      userId,
      role: "assistant",
      content: answer,
    });

    // --------------------------------------------------
    // Update chat timestamp
    // --------------------------------------------------

    chat.updatedAt = new Date();
    await chat.save();

    // --------------------------------------------------
    // Send response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",

      data: {
        ...result,
        chatId: chat._id,
        answer,
      },
    });

  } catch (error) {
    console.error("AI CHAT CONTROLLER ERROR:");
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate AI response",
    });
  }
};

// ======================================================
// Get AI Doctor Chat History
// ======================================================

const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user's latest chat
    const chat = await Chat.findOne({
      userId,
    }).sort({
      updatedAt: -1,
    });

    // No chat history yet
    if (!chat) {
      return res.status(200).json({
        success: true,
        message: "No chat history found",
        data: {
          chat: null,
          messages: [],
        },
      });
    }

    // Get all messages from this chat
    const messages = await Message.find({
      chatId: chat._id,
      userId,
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      data: {
        chat,
        messages,
      },
    });

  } catch (error) {
    console.error("GET AI CHAT HISTORY ERROR:");
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch chat history",
    });
  }
};

// ======================================================
// Exports
// ======================================================

module.exports = {
  chat,
  getChatHistory,
};