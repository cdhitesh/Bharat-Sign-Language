// backend/middleware/authMiddleware.js

import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import * as ClerkBackend from "@clerk/backend";

/**
 * Verify Clerk JWT — works with all @clerk/backend versions
 */
const verifyClerkToken = async (token) => {
  const secretKey = process.env.CLERK_SECRET_KEY;

  // Try method 1 — named export verifyToken (v1.x)
  if (typeof ClerkBackend.verifyToken === "function") {
    return await ClerkBackend.verifyToken(token, { secretKey });
  }

  // Try method 2 — createClerkClient (v1.x/v2.x)
  if (typeof ClerkBackend.createClerkClient === "function") {
    const client = ClerkBackend.createClerkClient({ secretKey });
    if (typeof client.verifyToken === "function") {
      return await client.verifyToken(token);
    }
  }

  // Try method 3 — default export
  if (typeof ClerkBackend.default?.verifyToken === "function") {
    return await ClerkBackend.default.verifyToken(token, { secretKey });
  }

  throw new Error(
    "Could not find verifyToken in @clerk/backend. " +
    "Run: npm list @clerk/backend to check your version."
  );
};

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Authorization token missing or malformed.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401);
    throw new Error("Token is empty.");
  }

  let payload;
  try {
    payload = await verifyClerkToken(token);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401);
    throw new Error("Invalid or expired token. Please sign in again.");
  }

  if (!payload?.sub) {
    res.status(401);
    throw new Error("Invalid token payload.");
  }

  req.auth = payload;

  const user = await User.findOne({ clerkId: payload.sub }).select("-__v");

  if (!user) {
    res.status(401);
    throw new Error(
      "User not found. Please sign out and sign in again."
    );
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated.");
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied. Admins only.");
};

export { protect, adminOnly };