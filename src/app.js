const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Authentication routes
const authRoutes = require("./routes/auth.routes");

// Medicine analysis routes
const medicineRoutes = require("./routes/medicine.routes");

// Search history routes
const searchHistoryRoutes = require("./routes/searchHistory.routes");

// Prescription routes
const prescriptionRoutes = require("./routes/prescription.routes");

//Medical Report routes
const medicalReportRoutes = require("./routes/medicalReport.routes");

const app = express();

// Basic security middleware
app.use(helmet());

// Allow frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Authentication API routes
app.use("/api/auth", authRoutes);

// Medicine analysis API routes
app.use("/api/medicine", medicineRoutes);

// Search history API routes
app.use("/api/history", searchHistoryRoutes);

// Prescription API routes
app.use("/api/prescriptions", prescriptionRoutes);

//Medical Report routes
app.use("/api/reports", medicalReportRoutes);

// Backend health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Medical AI Backend is running 🚀",
  });
});

module.exports = app;