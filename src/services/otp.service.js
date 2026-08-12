// OTP verification service
const OTP = require("../models/OTP");
const generateOTP = require("../utils/otp");

// Email service for sending OTP
const { sendOTPEmail } = require("./email.service");

// Verify signup OTP
const verifySignupOTP = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find latest signup OTP
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    purpose: "signup",
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  // Check OTP expiry
  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("OTP has expired");
  }

  // Limit wrong OTP attempts
  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("Too many incorrect attempts");
  }

  // Check OTP value
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    throw new Error("Invalid OTP");
  }

  return otpRecord;
};

// Generate and send a new signup OTP
const resendSignupOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find pending signup data
  const existingOTP = await OTP.findOne({
    email: normalizedEmail,
    purpose: "signup",
  }).sort({ createdAt: -1 });

  if (!existingOTP) {
    throw new Error("No pending signup found for this email");
  }

  // Check 1-minute resend cooldown
  const oneMinute = 60 * 1000;

  // Use lastSentAt, or createdAt for older OTP records
  const lastSentTime =
    existingOTP.lastSentAt || existingOTP.createdAt;

  const timeSinceLastSent =
    Date.now() - lastSentTime.getTime();

  if (timeSinceLastSent < oneMinute) {
    const remainingSeconds = Math.ceil(
      (oneMinute - timeSinceLastSent) / 1000
    );

    throw new Error(
      `Please wait ${remainingSeconds} seconds before requesting a new OTP`
    );
  }

  // Generate new 6-digit OTP
  const newOTP = generateOTP();

  // Update OTP, attempts and expiry
  existingOTP.otp = newOTP;
  existingOTP.attempts = 0;
  existingOTP.expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );
  existingOTP.lastSentAt = new Date();

  await existingOTP.save();

  // Send new OTP email
  await sendOTPEmail(normalizedEmail, newOTP);

  return {
    email: normalizedEmail,
  };
};

// Generate and send forgot-password OTP
const sendForgotPasswordOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Generate 6-digit OTP
  const otp = generateOTP();

  // Remove previous forgot-password OTP
  await OTP.deleteMany({
    email: normalizedEmail,
    purpose: "forgot-password",
  });

  // Save password reset OTP
  await OTP.create({
    email: normalizedEmail,
    otp,
    purpose: "forgot-password",
    attempts: 0,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    lastSentAt: new Date(),
  });

  // Send OTP to user's email
  await sendOTPEmail(normalizedEmail, otp);

  return {
    email: normalizedEmail,
  };
};

// Verify forgot-password OTP
const verifyForgotPasswordOTP = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find latest password-reset OTP
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    purpose: "forgot-password",
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  // Check OTP expiry
  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("OTP has expired");
  }

  // Limit wrong OTP attempts
  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error("Too many incorrect attempts");
  }

  // Check OTP value
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    throw new Error("Invalid OTP");
  }

  return otpRecord;
};

// Resend forgot-password OTP
const resendForgotPasswordOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find existing password-reset OTP
  const existingOTP = await OTP.findOne({
    email: normalizedEmail,
    purpose: "forgot-password",
  }).sort({ createdAt: -1 });

  if (!existingOTP) {
    throw new Error("No pending password reset found");
  }

  // Check 1-minute resend cooldown
  const oneMinute = 60 * 1000;

  // Use lastSentAt, or createdAt for older OTP records
  const lastSentTime =
    existingOTP.lastSentAt || existingOTP.createdAt;

  const timeSinceLastSent =
    Date.now() - lastSentTime.getTime();

  if (timeSinceLastSent < oneMinute) {
    const remainingSeconds = Math.ceil(
      (oneMinute - timeSinceLastSent) / 1000
    );

    throw new Error(
      `Please wait ${remainingSeconds} seconds before requesting a new OTP`
    );
  }

  // Generate new OTP
  const newOTP = generateOTP();

  // Update OTP and reset verification attempts
  existingOTP.otp = newOTP;
  existingOTP.attempts = 0;
  existingOTP.expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );
  existingOTP.lastSentAt = new Date();

  await existingOTP.save();

  // Send new OTP email
  await sendOTPEmail(normalizedEmail, newOTP);

  return {
    email: normalizedEmail,
  };
};

// Export OTP services
module.exports = {
  verifySignupOTP,
  resendSignupOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resendForgotPasswordOTP,
};