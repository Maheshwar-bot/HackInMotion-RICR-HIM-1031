const express = require("express");
const { signup, 
    verifySignup, 
    login,
    getMe,
 } = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Signup and send OTP
router.post("/signup", signup);

// Verify signup OTP
router.post("/verify-signup-otp", verifySignup);

// Login with email and password
router.post("/login", login);

// Get authenticated user
router.get("/me", authMiddleware, getMe);

module.exports = router;