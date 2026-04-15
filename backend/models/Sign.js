// backend/models/Sign.js

import mongoose from "mongoose";

const signSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sign name is required"],
      trim: true,
      maxlength: [100, "Sign name cannot exceed 100 characters"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject reference is required"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true, 
    },
    meaning: {
      type: String,
      required: [true, "Meaning is required"],
      trim: true,
      maxlength: [1000, "Meaning cannot exceed 1000 characters"],
    },
    keywords: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "A sign cannot have more than 20 keywords",
      },
    },
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for fast subject-based queries
signSchema.index({ subjectId: 1, name: 1 });

// Full-text search index on name, meaning, and keywords
signSchema.index(
  { name: "text", meaning: "text", keywords: "text" },
  {
    weights: {
      name: 10,     // Name matches ranked highest
      keywords: 5,  // Keyword matches ranked second
      meaning: 1,   // Meaning matches ranked lowest
    },
    name: "sign_text_index",
  }
);

const Sign = mongoose.model("Sign", signSchema);

export default Sign;