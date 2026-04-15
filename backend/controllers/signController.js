// backend/controllers/signController.js

import asyncHandler from "../utils/asyncHandler.js";
import Sign from "../models/Sign.js";
import Subject from "../models/Subject.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * GET /api/v1/signs
 * Public — returns paginated signs, optionally filtered by subjectId.
 */
const getSigns = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

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

  const [signs, total] = await Promise.all([
    Sign.find(filter)
      .populate("subjectId", "name slug icon")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Sign.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: signs,
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
 * GET /api/v1/signs/:id
 * Public — returns a single sign with its subject info.
 */
const getSignById = asyncHandler(async (req, res) => {
  const sign = await Sign.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .populate("subjectId", "name slug icon")
    .select("-__v");

  if (!sign) {
    res.status(404);
    throw new Error("Sign not found.");
  }

  res.status(200).json({
    success: true,
    data: sign,
  });
});

/**
 * GET /api/v1/signs/subject/:subjectId
 * Public — returns all signs for a specific subject (no pagination).
 * Used for quiz and library views that need all signs at once.
 */
const getSignsBySubject = asyncHandler(async (req, res) => {
  // Verify subject exists
  const subject = await Subject.findOne({
    _id: req.params.subjectId,
    isActive: true,
  });

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  const signs = await Sign.find({
    subjectId: req.params.subjectId,
    isActive: true,
  })
    .sort({ name: 1 })
    .select("-__v");

  res.status(200).json({
    success: true,
    count: signs.length,
    subject: {
      _id: subject._id,
      name: subject.name,
      slug: subject.slug,
    },
    data: signs,
  });
});

/**
 * POST /api/v1/signs
 * Admin only — create a new sign.
 */
const createSign = asyncHandler(async (req, res) => {
  const {
    name,
    subjectId,
    imageUrl,
    videoUrl,
    meaning,
    keywords,
    difficultyLevel,
  } = req.body;

  if (!name || !subjectId || !imageUrl || !meaning) {
    res.status(400);
    throw new Error("name, subjectId, imageUrl, and meaning are required.");
  }

  // Verify subject exists and is active
  const subject = await Subject.findOne({ _id: subjectId, isActive: true });
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found or is inactive.");
  }

  // Normalize keywords to lowercase trimmed strings
  const normalizedKeywords = Array.isArray(keywords)
    ? keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
    : [];

  const sign = await Sign.create({
    name: name.trim(),
    subjectId,
    imageUrl: imageUrl.trim(),
    videoUrl: videoUrl?.trim(),
    meaning: meaning.trim(),
    keywords: normalizedKeywords,
    difficultyLevel: difficultyLevel || "beginner",
  });

  res.status(201).json({
    success: true,
    message: "Sign created successfully.",
    data: sign,
  });
});

/**
 * PUT /api/v1/signs/:id
 * Admin only — update a sign.
 */
const updateSign = asyncHandler(async (req, res) => {
  const {
    name,
    imageUrl,
    videoUrl,
    meaning,
    keywords,
    difficultyLevel,
    isActive,
  } = req.body;

  const sign = await Sign.findById(req.params.id);

  if (!sign) {
    res.status(404);
    throw new Error("Sign not found.");
  }

  if (name !== undefined) sign.name = name.trim();
  if (imageUrl !== undefined) sign.imageUrl = imageUrl.trim();
  if (videoUrl !== undefined) sign.videoUrl = videoUrl.trim();
  if (meaning !== undefined) sign.meaning = meaning.trim();
  if (difficultyLevel !== undefined) sign.difficultyLevel = difficultyLevel;
  if (isActive !== undefined) sign.isActive = isActive;
  if (keywords !== undefined) {
    sign.keywords = Array.isArray(keywords)
      ? keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
      : [];
  }

  const updated = await sign.save();

  res.status(200).json({
    success: true,
    message: "Sign updated successfully.",
    data: updated,
  });
});

/**
 * DELETE /api/v1/signs/:id
 * Admin only — soft delete a sign.
 */
const deleteSign = asyncHandler(async (req, res) => {
  const sign = await Sign.findById(req.params.id);

  if (!sign) {
    res.status(404);
    throw new Error("Sign not found.");
  }

  sign.isActive = false;
  await sign.save();

  res.status(200).json({
    success: true,
    message: "Sign deactivated successfully.",
  });
});

export {
  getSigns,
  getSignById,
  getSignsBySubject,
  createSign,
  updateSign,
  deleteSign,
};