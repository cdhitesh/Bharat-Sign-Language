// backend/routes/quizRoutes.js

import express from "express";
import {
  getQuizSigns,
  submitAttempt,
  submitBatchAttempts,
  getStats,
  getQuizHistory,
} from "../controllers/quizController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All quiz routes are protected
router.use(protect);

// GET  /api/v1/quiz/signs
router.get("/signs", getQuizSigns);

// GET  /api/v1/quiz/stats
router.get("/stats", getStats);

// GET  /api/v1/quiz/history
router.get("/history", getQuizHistory);

// POST /api/v1/quiz/attempt
router.post("/attempt", submitAttempt);

// POST /api/v1/quiz/attempts/batch
router.post("/attempts/batch", submitBatchAttempts);

export default router;