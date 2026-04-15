// backend/routes/searchRoutes.js

import express from "express";
import {
  searchSigns,
  getSearchSuggestions,
} from "../controllers/searchController.js";

const router = express.Router();

// GET /api/v1/search?q=hello
router.get("/", searchSigns);

// GET /api/v1/search/suggestions?q=hel
router.get("/suggestions", getSearchSuggestions);

export default router;