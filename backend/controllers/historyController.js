// backend/controllers/historyController.js

import asyncHandler from "../utils/asyncHandler.js";
import History from "../models/History.js";
import mlService from "../services/MLService.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/**
 * POST /api/v1/history/predict
 * Protected — calls ML service, saves result to history, returns prediction.
 */
const predict = asyncHandler(async (req, res) => {
  const { inputType, inputContent } = req.body;

  if (!inputType || !inputContent) {
    res.status(400);
    throw new Error("inputType and inputContent are required.");
  }

  const validTypes = ["text", "speech", "image"];
  if (!validTypes.includes(inputType)) {
    res.status(400);
    throw new Error(`inputType must be one of: ${validTypes.join(", ")}`);
  }

  if (inputContent.trim().length === 0) {
    res.status(400);
    throw new Error("inputContent cannot be empty.");
  }

  // Call ML microservice via service layer
  const { predictedSign, confidenceScore, metadata } = await mlService.predict(
    inputType,
    inputContent.trim()
  );

  // Persist to history
  const historyEntry = await History.create({
    userId: req.user._id,
    inputType,
    inputContent: inputContent.trim(),
    predictedSign,
    confidenceScore,
    metadata,
  });

  res.status(201).json({
    success: true,
    message: "Prediction successful.",
    data: historyEntry,
  });
});

/**
 * GET /api/v1/history
 * Protected — returns paginated history for the authenticated user.
 * Query params: page, limit, inputType
 */
const getHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  // Optional filter by inputType
  const filter = { userId: req.user._id };
  if (req.query.inputType) {
    const validTypes = ["text", "speech", "image"];
    if (validTypes.includes(req.query.inputType)) {
      filter.inputType = req.query.inputType;
    }
  }

  const [history, total] = await Promise.all([
    History.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    History.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: history,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
});

/**
 * GET /api/v1/history/:id
 * Protected — returns a single history entry (must belong to requesting user).
 */
const getHistoryById = asyncHandler(async (req, res) => {
  const entry = await History.findOne({
    _id: req.params.id,
    userId: req.user._id, // Ownership check
  }).select("-__v");

  if (!entry) {
    res.status(404);
    throw new Error("History entry not found.");
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

/**
 * PATCH /api/v1/history/:id/favorite
 * Protected — toggle isFavorited on a history entry.
 */
const toggleFavorite = asyncHandler(async (req, res) => {
  const entry = await History.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!entry) {
    res.status(404);
    throw new Error("History entry not found.");
  }

  entry.isFavorited = !entry.isFavorited;
  await entry.save();

  res.status(200).json({
    success: true,
    message: `Entry ${entry.isFavorited ? "favorited" : "unfavorited"}.`,
    data: entry,
  });
});

/**
 * DELETE /api/v1/history/:id
 * Protected — deletes a single history entry owned by the user.
 */
const deleteHistoryEntry = asyncHandler(async (req, res) => {
  const entry = await History.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!entry) {
    res.status(404);
    throw new Error("History entry not found or already deleted.");
  }

  res.status(200).json({
    success: true,
    message: "History entry deleted.",
  });
});

/**
 * DELETE /api/v1/history
 * Protected — clears ALL history for the authenticated user.
 */
const clearHistory = asyncHandler(async (req, res) => {
  const result = await History.deleteMany({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} history entries cleared.`,
  });
});

export {
  predict,
  getHistory,
  getHistoryById,
  toggleFavorite,
  deleteHistoryEntry,
  clearHistory,
};