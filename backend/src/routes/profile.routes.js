const express = require("express");

const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");
const profileUpload = require("../middleware/profileUpload.middleware");

const router = express.Router();

// ======================================================
// GET PROFILE
// ======================================================

router.get(
  "/",
  authMiddleware,
  profileController.getProfile
);

// ======================================================
// UPDATE PROFILE
// Name / Age / Blood Group
// ======================================================

router.put(
  "/",
  authMiddleware,
  profileController.updateProfile
);

// ======================================================
// UPLOAD PROFILE IMAGE
// ======================================================

router.post(
  "/image",
  authMiddleware,
  profileUpload.single("profileImage"),
  profileController.uploadProfileImage
);

module.exports = router;