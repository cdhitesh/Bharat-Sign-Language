// backend/controllers/authController.js

import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

/**
 * POST /api/v1/auth/sync
 */
const syncUser = asyncHandler(async (req, res) => {
  const { clerkId, name, email } = req.body;

  if (!clerkId || !name || !email) {
    res.status(400);
    throw new Error("clerkId, name, and email are required.");
  }

  // Find by clerkId first
  let user = await User.findOne({ clerkId });

  if (user) {
    // User exists — update name/email in case they changed
    user.name  = name;
    user.email = email;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User synced successfully.",
      data:    user,
    });
  }

  // Check if email already exists under different clerkId
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    // Update that record with the new clerkId
    emailExists.clerkId = clerkId;
    emailExists.name    = name;
    await emailExists.save();

    return res.status(200).json({
      success: true,
      message: "User synced successfully.",
      data:    emailExists,
    });
  }

  // Create new user
  user = await User.create({ clerkId, name, email });

  res.status(201).json({
    success: true,
    message: "User created successfully.",
    data:    user,
  });
});

/**
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data:    req.user,
  });
});

/**
 * PUT /api/v1/auth/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error("Name is required and cannot be empty.");
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select("-__v");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data:    updated,
  });
});

export { syncUser, getMe, updateMe };