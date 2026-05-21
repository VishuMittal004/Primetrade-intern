'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Protect routes — verifies JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Not authorized, no token provided', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired, please log in again', 401);
      }
      return sendError(res, 'Invalid token, please log in again', 401);
    }

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Contact support.', 401);
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return sendError(res, 'Password changed recently. Please log in again.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * Restrict routes to specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied: role '${req.user.role}' is not authorized for this action`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
