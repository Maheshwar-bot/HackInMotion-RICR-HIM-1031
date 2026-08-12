const express = require("express");
const { signup, 
    verifySignup, 
    login,
 } = require("../controllers/auth.controller");

const router = express.Router();

// Signup and send OTP
router.post("/signup", signup);

// Verify signup OTP
router.post("/verify-signup-otp", verifySignup);

// Login with email and password
router.post("/login", login);

module.exports = router;