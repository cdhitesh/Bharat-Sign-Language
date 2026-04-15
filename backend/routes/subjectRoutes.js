// backend/routes/subjectRoutes.js

import express from "express";
import {
  getSubjects,
  getSubjectById,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSubjects);
router.get("/slug/:slug", getSubjectBySlug);
router.get("/:id", getSubjectById);

// Admin only routes
router.post("/", protect, adminOnly, createSubject);
router.put("/:id", protect, adminOnly, updateSubject);
router.delete("/:id", protect, adminOnly, deleteSubject);

export default router;