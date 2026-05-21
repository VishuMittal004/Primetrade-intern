'use strict';

/**
 * Consistent API response helpers
 */

/**
 * Send a successful response
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Send an error response
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Build a paginated response object
 */
const buildPagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { sendSuccess, sendCreated, sendError, buildPagination };
