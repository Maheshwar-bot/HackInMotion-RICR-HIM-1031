const express = require("express");
const { signup, 
    verifySignup } = require("../controllers/auth.controller");

const router = express.Router();

// Signup and send OTP
router.post("/signup", signup);

// Verify signup OTP
router.post("/verify-signup-otp", verifySignup);

module.exports = router;