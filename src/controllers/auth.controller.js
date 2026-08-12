const authService = require("../services/auth.service");

// OTP service for resend operations
const otpService = require("../services/otp.service");

// Handle signup request
const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check minimum password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Create temporary signup and send OTP
    const result = await authService.signup({
      name,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: result.email,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify signup OTP and create account
const verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Verify OTP and create user
    const user = await authService.verifySignup({
      email,
      otp,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle login request
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Authenticate user
    const result = await authService.login({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        profileImage: result.user.profileImage,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle current user request
const getMe = async (req, res) => {
  try {
    // Get authenticated user
    const user = await authService.getCurrentUser(req.userId);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle resend signup OTP request
const resendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate and send new OTP
    const result = await otpService.resendSignupOTP(email);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      email: result.email,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  verifySignup,
  login,
  getMe,
  resendSignupOTP,
};