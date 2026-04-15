// backend/server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import signRoutes from "./routes/signRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set secure HTTP headers
app.use(helmet());

// CORS — allow only frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use(globalLimiter);

// Stricter rate limiter for ML prediction endpoint
const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: "Too many prediction requests. Please slow down.",
  },
});

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined")); // More verbose for production log analysis
}

// Health Check

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/history`, historyRoutes);
app.use(`${API_PREFIX}/signs`, signRoutes);
app.use(`${API_PREFIX}/subjects`, subjectRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/quiz`, quizRoutes);

// Apply ML-specific rate limiter to predict route
app.use(`${API_PREFIX}/history/predict`, mlLimiter);

// ─── Error Handling
app.use(notFound);
app.use(errorHandler);

// ─── Start Server

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown on unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    console.log("Server closed due to unhandled rejection.");
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM (e.g., Docker/Kubernetes stop signal)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});

export default app;