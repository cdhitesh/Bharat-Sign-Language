// backend/routes/authRoutes.js

import express from "express";
import { syncUser, getMe, updateMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/v1/auth/sync — public, called after Clerk sign-in
router.post("/sync", syncUser);

// GET /api/v1/auth/me — protected
router.get("/me", protect, getMe);

// PUT /api/v1/auth/me — protected
router.put("/me", protect, updateMe);

export default router;