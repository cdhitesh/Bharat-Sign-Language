// backend/models/History.js

import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    inputType: {
      type: String,
      enum: ["text", "speech", "image"],
      required: [true, "Input type is required"],
    },
    inputContent: {
      type: String,
      required: [true, "Input content is required"],
      trim: true,
      maxlength: [2000, "Input content cannot exceed 2000 characters"],
    },
    predictedSign: {
      type: String,
      required: [true, "Predicted sign is required"],
      trim: true,
    },
    confidenceScore: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: [0, "Confidence score cannot be less than 0"],
      max: [1, "Confidence score cannot exceed 1"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Store extra ML response data (e.g., top-k predictions)
    },
    isFavorited: {
      type: Boolean,
      default: false, // Allow users to bookmark important predictions
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fetch all history for a user sorted by newest first
historySchema.index({ userId: 1, createdAt: -1 });

const History = mongoose.model("History", historySchema);

export default History;