// backend/controllers/searchController.js

import asyncHandler from "../utils/asyncHandler.js";
import Sign from "../models/Sign.js";

const MAX_RESULTS = 50;

/**
 * GET /api/v1/search?q=hello&subjectId=xxx&difficulty=beginner
 * Public — full-text search on signs collection.
 * Uses MongoDB weighted text index on name, meaning, keywords.
 */
const searchSigns = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length < 1) {
    res.status(400);
    throw new Error("Search query 'q' is required.");
  }

  if (query.length > 100) {
    res.status(400);
    throw new Error("Search query cannot exceed 100 characters.");
  }

  const limit = Math.min(
    MAX_RESULTS,
    Math.max(1, parseInt(req.query.limit) || 20)
  );

  // Build filter
  const filter = {
    $text: { $search: query },
    isActive: true,
  };

  // Optional subject filter
  if (req.query.subjectId) {
    filter.subjectId = req.query.subjectId;
  }

  // Optional difficulty filter
  if (req.query.difficulty) {
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (validLevels.includes(req.query.difficulty)) {
      filter.difficultyLevel = req.query.difficulty;
    }
  }

  const signs = await Sign.find(filter, {
    // Include text match score for relevance sorting
    score: { $meta: "textScore" },
  })
    .populate("subjectId", "name slug icon")
    .sort({ score: { $meta: "textScore" } }) // Best matches first
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    query,
    count: signs.length,
    data: signs,
  });
});

/**
 * GET /api/v1/search/suggestions?q=hel
 * Public — lightweight autocomplete suggestions (name only).
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Regex search on name for fast autocomplete
  const suggestions = await Sign.find({
    name: { $regex: `^${query}`, $options: "i" },
    isActive: true,
  })
    .sort({ name: 1 })
    .limit(8)
    .select("name meaning imageUrl");

  res.status(200).json({
    success: true,
    data: suggestions,
  });
});

export { searchSigns, getSearchSuggestions };