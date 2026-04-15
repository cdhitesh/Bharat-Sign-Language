// backend/utils/asyncHandler.js

/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express error middleware.
 *
 * Usage:
 *   router.get("/route", asyncHandler(async (req, res) => { ... }))
 *
 * Eliminates the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler;