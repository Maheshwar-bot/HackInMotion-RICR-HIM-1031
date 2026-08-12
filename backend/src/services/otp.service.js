// OTP verification service
const OTP = require("../models/OTP");

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

module.exports = {
  verifySignupOTP,
};