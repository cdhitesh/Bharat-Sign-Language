// backend/controllers/quizController.js

import asyncHandler from "../utils/asyncHandler.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Sign from "../models/Sign.js";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/v1/quiz/signs?subjectId=xxx&limit=10&difficulty=beginner
 * Protected — returns a randomized set of signs for a quiz session.
 */
const getQuizSigns = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const filter = { isActive: true };

  if (req.query.subjectId) {
    filter.subjectId = req.query.subjectId;
  }

  if (req.query.difficulty) {
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (validLevels.includes(req.query.difficulty)) {
      filter.difficultyLevel = req.query.difficulty;
    }
  }

  // MongoDB $sample for random selection — efficient on indexed collections
  const signs = await Sign.aggregate([
    { $match: filter },
    { $sample: { size: limit } },
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  if (signs.length === 0) {
    res.status(404);
    throw new Error("No signs found for the given filters.");
  }

  // Generate a unique session ID for grouping attempts
  const sessionId = uuidv4();

  res.status(200).json({
    success: true,
    sessionId,
    count: signs.length,
    data: signs,
  });
});

/**
 * POST /api/v1/quiz/attempt
 * Protected — record a single quiz attempt.
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const { signId, subjectId, isCorrect, timeTakenMs, sessionId } = req.body;

  if (!signId || !subjectId || isCorrect === undefined) {
    res.status(400);
    throw new Error("signId, subjectId, and isCorrect are required.");
  }

  // Verify sign exists
  const sign = await Sign.findOne({ _id: signId, isActive: true });
  if (!sign) {
    res.status(404);
    throw new Error("Sign not found.");
  }

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    signId,
    subjectId,
    isCorrect,
    timeTakenMs: timeTakenMs || null,
    sessionId: sessionId || uuidv4(),
  });

  res.status(201).json({
    success: true,
    message: "Attempt recorded.",
    data: attempt,
  });
});

/**
 * POST /api/v1/quiz/attempts/batch
 * Protected — record all attempts for a completed quiz session at once.
 * More efficient than submitting one by one.
 */
const submitBatchAttempts = asyncHandler(async (req, res) => {
  const { attempts, sessionId } = req.body;

  if (!Array.isArray(attempts) || attempts.length === 0) {
    res.status(400);
    throw new Error("attempts must be a non-empty array.");
  }

  if (attempts.length > 50) {
    res.status(400);
    throw new Error("Cannot submit more than 50 attempts at once.");
  }

  const sid = sessionId || uuidv4();

  const docs = attempts.map((a) => ({
    userId: req.user._id,
    signId: a.signId,
    subjectId: a.subjectId,
    isCorrect: a.isCorrect,
    timeTakenMs: a.timeTakenMs || null,
    sessionId: sid,
  }));

  const saved = await QuizAttempt.insertMany(docs, { ordered: false });

  res.status(201).json({
    success: true,
    message: `${saved.length} attempts recorded.`,
    sessionId: sid,
  });
});

/**
 * GET /api/v1/quiz/stats
 * Protected — returns accuracy stats for the authenticated user.
 * Query params: subjectId (optional)
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await QuizAttempt.getAccuracyStats(
    req.user._id,
    req.query.subjectId
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/v1/quiz/history
 * Protected — returns paginated quiz attempt history for the user.
 */
const getQuizHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id };
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.sessionId) filter.sessionId = req.query.sessionId;

  const [attempts, total] = await Promise.all([
    QuizAttempt.find(filter)
      .populate("signId", "name imageUrl meaning")
      .populate("subjectId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    QuizAttempt.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: attempts,
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

export {
  getQuizSigns,
  submitAttempt,
  submitBatchAttempts,
  getStats,
  getQuizHistory,
};