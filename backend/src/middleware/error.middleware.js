'use strict';

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error details
  if (statusCode === 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A user with this ${field} already exists`;
    errors = [{ field, message }];
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}'`;
  }

  // JWT Errors (should be caught in middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
