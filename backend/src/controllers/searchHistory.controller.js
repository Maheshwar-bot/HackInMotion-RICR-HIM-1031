// Search history controller

const searchHistoryService = require("../services/searchHistory.service");

// Get logged-in user's search history
const getSearchHistory = async (req, res) => {
  try {
    // User ID comes from auth middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get history
    const history =
      await searchHistoryService.getUserSearchHistory(
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Search history fetched successfully",
      data: history,
    });
  } catch (error) {
    console.error(
      "SEARCH HISTORY CONTROLLER ERROR:"
    );
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch search history",
    });
  }
};

module.exports = {
  getSearchHistory,
};