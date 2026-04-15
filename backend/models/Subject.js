// backend/models/Subject.js

import mongoose from "mongoose";
import slugify from "slugify";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Subject name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    icon: {
      type: String, // URL or icon class name (e.g., emoji or icon key)
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // For controlling display order in the UI
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: get all signs belonging to this subject
subjectSchema.virtual("signs", {
  ref: "Sign",
  localField: "_id",
  foreignField: "subjectId",
});

subjectSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;