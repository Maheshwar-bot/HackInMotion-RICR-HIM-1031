const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const generateOTP = require("../utils/otp");

// Email service for sending OTP
const { sendOTPEmail } = require("./email.service");

// OTP verification service
const { verifySignupOTP } = require("./otp.service");

// JWT utility for login token
const generateToken = require("../utils/jwt");

// Create signup OTP
const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is already registered
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  // Hash password before temporary storage
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate 6-digit OTP
  const otp = generateOTP();

  // Remove previous signup OTP
  await OTP.deleteMany({
    email: normalizedEmail,
    purpose: "signup",
  });

  // Save temporary signup data
  await OTP.create({
    email: normalizedEmail,
    name,
    passwordHash,
    otp,
    purpose: "signup",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Send OTP to user's email
  await sendOTPEmail(normalizedEmail, otp);

  return {
    email: normalizedEmail,
  };
};

// Verify signup OTP and create account
const verifySignup = async ({ email, otp }) => {
  // Verify OTP and get temporary signup data
  const otpRecord = await verifySignupOTP(email, otp);

  // Create verified user account
  const user = await User.create({
    name: otpRecord.name,
    email: otpRecord.email,
    password: otpRecord.passwordHash,
    authProvider: "local",
    isEmailVerified: true,
  });

  // Delete OTP after successful verification
  await OTP.deleteOne({
    _id: otpRecord._id,
  });

  return user;
};

// Login user with email and password
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and include hashed password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check email verification
  if (!user.isEmailVerified) {
    throw new Error("Please verify your email first");
  }

  // Compare entered password with stored hash
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    token,
    user,
  };
};

// Get currently authenticated user
const getCurrentUser = async (userId) => {
  // Find user without exposing password
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Reset user password
const resetPassword = async ({ userId, newPassword }) => {
  // Find user by authenticated reset-token user ID
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  // Hash new password using the same bcrypt setup
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  user.password = passwordHash;

  // Save updated password
  await user.save();

  return {
    user,
  };
};

module.exports = {
  signup,
  verifySignup,
  login,
  getCurrentUser,
  resetPassword,
};