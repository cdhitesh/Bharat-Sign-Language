// backend/routes/historyRoutes.js

import express from "express";
import {
  predict,
  getHistory,
  getHistoryById,
  toggleFavorite,
  deleteHistoryEntry,
  clearHistory,
} from "../controllers/historyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All history routes are protected
router.use(protect);

// POST /api/v1/history/predict
router.post("/predict", predict);

// GET  /api/v1/history
// DELETE /api/v1/history (clear all)
router.route("/").get(getHistory).delete(clearHistory);

// GET    /api/v1/history/:id
// DELETE /api/v1/history/:id
router.route("/:id").get(getHistoryById).delete(deleteHistoryEntry);

// PATCH /api/v1/history/:id/favorite
router.patch("/:id/favorite", toggleFavorite);

export default router;