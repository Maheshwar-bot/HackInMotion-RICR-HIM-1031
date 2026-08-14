const express = require("express");

const allergyController = require("../controllers/allergy.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Add allergy
router.post(
  "/",
  authMiddleware,
  allergyController.createAllergy
);

// Get logged-in user's allergies
router.get(
  "/",
  authMiddleware,
  allergyController.getUserAllergies
);

// Update allergy
router.put(
  "/:allergyId",
  authMiddleware,
  allergyController.updateAllergy
);

// Delete allergy
router.delete(
  "/:allergyId",
  authMiddleware,
  allergyController.deleteAllergy
);

module.exports = router;