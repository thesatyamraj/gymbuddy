const ApiResponse = require('../utils/ApiResponse');

/**
 * Global error handler middleware
 * Catches all errors passed via next(err) and returns consistent error responses
 */
const errorMiddleware = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      ApiResponse.error('File size too large. Maximum 5MB allowed.')
    );
  }

  // Multer file type error
  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json(
      ApiResponse.error(err.message)
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(
      ApiResponse.error('Validation failed', { details: errors })
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json(
      ApiResponse.error(`A user with this ${field} already exists.`)
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(
      ApiResponse.error('Invalid ID format.')
    );
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(statusCode).json(
    ApiResponse.error(message)
  );
};

module.exports = errorMiddleware;
