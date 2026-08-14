const Reminder = require("../models/Reminder");

// ======================================================
// CREATE REMINDER
// ======================================================

const createReminder = async (userId, reminderData) => {
  const { medicineName, time, frequency } = reminderData;

  const reminder = await Reminder.create({
    userId,
    medicineName,
    time,
    frequency: frequency || "daily",
  });

  return reminder;
};

// ======================================================
// GET USER REMINDERS
// ======================================================

const getUserReminders = async (userId) => {
  const reminders = await Reminder.find({
    userId,
  }).sort({
    time: 1,
  });

  return reminders;
};

// ======================================================
// UPDATE REMINDER
// ======================================================

const updateReminder = async (
  userId,
  reminderId,
  updateData
) => {
  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: reminderId,
      userId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  return reminder;
};

// ======================================================
// DELETE REMINDER
// ======================================================

const deleteReminder = async (
  userId,
  reminderId
) => {
  const reminder = await Reminder.findOneAndDelete({
    _id: reminderId,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  return reminder;
};

// ======================================================
// TOGGLE REMINDER
// ======================================================

const toggleReminder = async (
  userId,
  reminderId
) => {
  const reminder = await Reminder.findOne({
    _id: reminderId,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  reminder.enabled = !reminder.enabled;

  await reminder.save();

  return reminder;
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