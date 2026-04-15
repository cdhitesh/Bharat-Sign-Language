// backend/services/mlService.js

import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Axios instance dedicated to ML service
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 15000, // 15 seconds — ML inference can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Retry Logic ───────────────────────────────────────────────────────────────

/**
 * Retries a function up to `retries` times with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Max retry attempts
 * @param {number} delay - Initial delay in ms (doubles each retry)
 */
const withRetry = async (fn, retries = 3, delay = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === retries;
      const isRetryable =
        err.code === "ECONNREFUSED" ||
        err.code === "ETIMEDOUT" ||
        err.response?.status >= 500;

      if (isLast || !isRetryable) throw err;

      console.warn(
        `⚠️  ML Service: attempt ${attempt} failed. Retrying in ${delay}ms...`
      );
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// ── Service Methods ───────────────────────────────────────────────────────────

/**
 * Send input to FastAPI /predict endpoint.
 * @param {string} inputType - "text" | "speech" | "image"
 * @param {string} inputContent - The actual input string
 * @returns {{ prediction: string, confidence: number, metadata: object }}
 */
const predict = async (inputType, inputContent) => {
  const result = await withRetry(async () => {
    const response = await mlClient.post("/predict", {
      input_type: inputType,
      input_content: inputContent,
    });
    return response.data;
  });

  // Normalize response shape regardless of ML model version
  return {
    predictedSign: result.prediction,
    confidenceScore: parseFloat(result.confidence.toFixed(4)),
    metadata: result.metadata || {},
  };
};

/**
 * Health check for the ML microservice.
 * Used by monitoring or startup checks.
 * @returns {boolean}
 */
const checkMLHealth = async () => {
  try {
    const response = await mlClient.get("/health");
    return response.data?.status === "ok";
  } catch {
    return false;
  }
};

export default { predict, checkMLHealth };