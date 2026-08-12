const express = require("express");
const { signup, 
    verifySignup, 
    login,
    getMe,
    resendSignupOTP,
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


module.exports = router;