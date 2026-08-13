const SearchHistory = require("../models/searchHistory.model");

// Create search history
const createSearchHistory = async ({
  userId,
  medicine1,
  medicine2,
  riskLevel,
  mode,
}) => {
  return SearchHistory.create({
    userId,
    medicine1,
    medicine2,
    riskLevel,
    mode,
  });
};

// Get user's search history
const getUserSearchHistory = async (userId) => {
  return SearchHistory.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  createSearchHistory,
  getUserSearchHistory,
};