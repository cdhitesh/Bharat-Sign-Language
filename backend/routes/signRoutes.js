// backend/routes/signRoutes.js

import express from "express";
import {
  getSigns,
  getSignById,
  getSignsBySubject,
  createSign,
  updateSign,
  deleteSign,
} from "../controllers/signController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSigns);
router.get("/subject/:subjectId", getSignsBySubject);
router.get("/:id", getSignById);

// Admin only routes
router.post("/", protect, adminOnly, createSign);
router.put("/:id", protect, adminOnly, updateSign);
router.delete("/:id", protect, adminOnly, deleteSign);

export default router;