// frontend/src/utils/helpers.js

/**
 * Format ISO date string to readable format.
 * e.g. "2024-01-15T10:30:00.000Z" → "Jan 15, 2024, 10:30 AM"
 */
export const formatDate = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-IN", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format confidence score to percentage string.
 * e.g. 0.9231 → "92.3%"
 */
export const formatConfidence = (score) => {
  if (score === null || score === undefined) return "—";
  return `${(score * 100).toFixed(1)}%`;
};

/**
 * Get color class based on confidence score.
 */
export const getConfidenceColor = (score) => {
  if (score >= 0.8) return "text-green-600 bg-green-50";
  if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

/**
 * Get difficulty badge color.
 */
export const getDifficultyColor = (level) => {
  const map = {
    beginner:     "text-green-700 bg-green-100",
    intermediate: "text-yellow-700 bg-yellow-100",
    advanced:     "text-red-700 bg-red-100",
  };
  return map[level] || "text-gray-700 bg-gray-100";
};

/**
 * Truncate long strings with ellipsis.
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Capture canvas frame from video element as base64.
 * Used by webcam capture component.
 */
export const captureFrame = (videoEl, quality = 0.8) => {
  const canvas = document.createElement("canvas");
  canvas.width  = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  canvas
    .getContext("2d")
    .drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
};