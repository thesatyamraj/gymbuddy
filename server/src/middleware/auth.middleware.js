const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * JWT authentication middleware
 * Extracts token from Authorization header (Bearer token)
 * Verifies the token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        ApiResponse.error('Access denied. No token provided.')
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(
        ApiResponse.error('Access denied. Invalid token format.')
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json(
        ApiResponse.error('User not found. Token may be invalid.')
      );
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        ApiResponse.error('Token expired. Please refresh your token.')
      );
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        ApiResponse.error('Invalid token.')
      );
    }
    next(error);
  }
};

module.exports = authMiddleware;
