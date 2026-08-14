const express = require("express");
const { signup, 
    verifySignup, 
    login,
    getMe,
    resendSignupOTP,
    forgotPassword,
    verifyForgotPassword,
    resetPassword,
    resendForgotPasswordOTP,
 } = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Signup and send OTP
router.post("/signup", signup);

// Verify signup OTP
router.post("/verify-signup-otp", verifySignup);

// Login with email and password
router.post("/login", login);

// Resend signup OTP
router.post("/resend-signup-otp", resendSignupOTP);

// Get authenticated user
router.get("/me", authMiddleware, getMe);

// Send forgot-password OTP
router.post("/forgot-password", forgotPassword);

// Verify forgot-password OTP
router.post("/verify-forgot-password-otp", verifyForgotPassword);

// Reset password using verified reset token
router.post("/reset-password", resetPassword);

// Resend forgot-password OTP
router.post(
  "/resend-forgot-password-otp",
  resendForgotPasswordOTP
);

module.exports = router;