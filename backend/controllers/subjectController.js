// backend/controllers/subjectController.js

import asyncHandler from "../utils/asyncHandler.js";
import Subject from "../models/Subject.js";
import Sign from "../models/Sign.js";

/**
 * GET /api/v1/subjects
 * Public — returns all active subjects, sorted by display order.
 */
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .select("-__v");

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  });
});

/**
 * GET /api/v1/subjects/:id
 * Public — returns a single subject with its signs.
 */
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    isActive: true,
  }).select("-__v");

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  // Fetch signs belonging to this subject
  const signs = await Sign.find({
    subjectId: subject._id,
    isActive: true,
  })
    .sort({ name: 1 })
    .select("-__v");

  res.status(200).json({
    success: true,
    data: {
      ...subject.toObject(),
      signs,
    },
  });
});

/**
 * GET /api/v1/subjects/slug/:slug
 * Public — fetch subject by slug (for clean URLs).
 */
const getSubjectBySlug = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select("-__v");

  if (!subject) {
    res.status(404);
    throw new Error(`Subject with slug '${req.params.slug}' not found.`);
  }

  const signs = await Sign.find({
    subjectId: subject._id,
    isActive: true,
  })
    .sort({ name: 1 })
    .select("-__v");

  res.status(200).json({
    success: true,
    data: {
      ...subject.toObject(),
      signs,
    },
  });
});

/**
 * POST /api/v1/subjects
 * Admin only — create a new subject.
 */
const createSubject = asyncHandler(async (req, res) => {
  const { name, description, icon, order } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Subject name is required.");
  }

  const subject = await Subject.create({
    name: name.trim(),
    description: description?.trim(),
    icon,
    order: order || 0,
  });

  res.status(201).json({
    success: true,
    message: "Subject created successfully.",
    data: subject,
  });
});

/**
 * PUT /api/v1/subjects/:id
 * Admin only — update an existing subject.
 */
const updateSubject = asyncHandler(async (req, res) => {
  const { name, description, icon, order, isActive } = req.body;

  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  if (name !== undefined) subject.name = name.trim();
  if (description !== undefined) subject.description = description.trim();
  if (icon !== undefined) subject.icon = icon;
  if (order !== undefined) subject.order = order;
  if (isActive !== undefined) subject.isActive = isActive;

  const updated = await subject.save(); // Triggers pre-save hook for slug

  res.status(200).json({
    success: true,
    message: "Subject updated successfully.",
    data: updated,
  });
});

/**
 * DELETE /api/v1/subjects/:id
 * Admin only — soft delete (sets isActive to false).
 * Also deactivates all signs under this subject.
 */
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  // Soft delete subject
  subject.isActive = false;
  await subject.save();

  // Soft delete all signs under this subject
  await Sign.updateMany(
    { subjectId: subject._id },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: "Subject and its signs deactivated successfully.",
  });
});

export {
  getSubjects,
  getSubjectById,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
};