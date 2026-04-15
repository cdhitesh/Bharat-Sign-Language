// backend/middleware/errorMiddleware.js

/**
 * 404 handler — fires when no route matched
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — catches all errors forwarded via next(err)
 */
const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: Bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  //  Mongoose: Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: '${field}'. Please use a unique value.`;
  }

  // Mongoose: Validation Error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // JWT / Clerk Auth Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please sign in again."
        : "Invalid authentication token.";
  }

  // Axios / ML Service Errors
  if (err.isAxiosError) {
    statusCode = 502;
    message = "ML service is unavailable. Please try again later.";

    if (process.env.NODE_ENV === "development") {
      console.error("ML Service Error:", err.response?.data || err.message);
    }
  }

  // Response
  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { notFound, errorHandler };