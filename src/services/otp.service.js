// OTP verification service
const OTP = require("../models/OTP");
const generateOTP = require("../utils/otp");

// Email service for sending OTP
const { sendOTPEmail } = require("./email.service");

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
const lastSentTime = existingOTP.lastSentAt || existingOTP.createdAt;

const timeSinceLastSent = Date.now() - lastSentTime.getTime();

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
  existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  existingOTP.lastSentAt = new Date();

  await existingOTP.save();

  // Send new OTP email
  await sendOTPEmail(normalizedEmail, newOTP);

  return {
    email: normalizedEmail,
  };
};

module.exports = {
  verifySignupOTP,
  resendSignupOTP,
};