const express = require("express");

const reminderController = require("../controllers/reminder.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Create reminder
router.post(
  "/",
  authMiddleware,
  reminderController.createReminder
);

// Get logged-in user's reminders
router.get(
  "/",
  authMiddleware,
  reminderController.getUserReminders
);

// Update reminder
router.put(
  "/:reminderId",
  authMiddleware,
  reminderController.updateReminder
);

// Toggle reminder on/off
router.patch(
  "/:reminderId/toggle",
  authMiddleware,
  reminderController.toggleReminder
);

// Delete reminder
router.delete(
  "/:reminderId",
  authMiddleware,
  reminderController.deleteReminder
);

module.exports = router;