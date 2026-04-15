// backend/models/QuizAttempt.js

import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    signId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sign",
      required: [true, "Sign reference is required"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject reference is required"],
    },
    isCorrect: {
      type: Boolean,
      required: [true, "Result (correct/incorrect) is required"],
    },
    timeTakenMs: {
      type: Number,
      min: [0, "Time taken cannot be negative"],
      default: null, // Optional: track how long user took to answer
    },
    sessionId: {
      type: String,
      trim: true,
      index: true, // Group attempts by quiz session
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for analytics: per-user performance per subject
quizAttemptSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

// Static: get accuracy stats for a user on a subject
quizAttemptSchema.statics.getAccuracyStats = async function (userId, subjectId) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (subjectId) match.subjectId = new mongoose.Types.ObjectId(subjectId);

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        correct: { $sum: { $cond: ["$isCorrect", 1, 0] } },
        avgTimeTakenMs: { $avg: "$timeTakenMs" },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        correct: 1,
        incorrect: { $subtract: ["$total", "$correct"] },
        accuracyPercent: {
          $round: [
            { $multiply: [{ $divide: ["$correct", "$total"] }, 100] },
            2,
          ],
        },
        avgTimeTakenMs: { $round: ["$avgTimeTakenMs", 0] },
      },
    },
  ]);

  return stats[0] || { total: 0, correct: 0, incorrect: 0, accuracyPercent: 0, avgTimeTakenMs: 0 };
};

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;