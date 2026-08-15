const reminderService = require("../services/reminder.service");

// ======================================================
// CREATE REMINDER
// ======================================================

const createReminder = async (req, res) => {
  try {
    const { medicineName, time, frequency } = req.body;

    if (!medicineName || !time) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and time are required",
      });
    }

    const reminder =
      await reminderService.createReminder(
        req.userId,
        {
          medicineName,
          time,
          frequency,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error(
      "CREATE REMINDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create reminder",
    });
  }
};

// ======================================================
// GET USER REMINDERS
// ======================================================

const getUserReminders = async (req, res) => {
  try {
    const reminders =
      await reminderService.getUserReminders(
        req.userId
      );

    return res.status(200).json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error(
      "GET REMINDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

// ======================================================
// UPDATE REMINDER
// ======================================================

const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder =
      await reminderService.updateReminder(
        req.userId,
        reminderId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error(
      "UPDATE REMINDER ERROR:",
      error
    );

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update reminder",
    });
  }
};

// ======================================================
// DELETE REMINDER
// ======================================================

const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    await reminderService.deleteReminder(
      req.userId,
      reminderId
    );

    return res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE REMINDER ERROR:",
      error
    );

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete reminder",
    });
  }
};

// ======================================================
// TOGGLE REMINDER
// ======================================================

const toggleReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder =
      await reminderService.toggleReminder(
        req.userId,
        reminderId
      );

    return res.status(200).json({
      success: true,
      message: "Reminder status updated",
      reminder,
    });
  } catch (error) {
    console.error(
      "TOGGLE REMINDER ERROR:",
      error
    );

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle reminder",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createReminder,
  getUserReminders,
  updateReminder,
  deleteReminder,
  toggleReminder,
};