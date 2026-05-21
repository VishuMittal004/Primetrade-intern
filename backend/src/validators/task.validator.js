'use strict';

const { body, query, param } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601 format)')
    .toDate(),

  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Tags must be an array with at most 10 items')
    .custom((tags) => {
      if (tags.some((t) => typeof t !== 'string' || t.length > 30)) {
        throw new Error('Each tag must be a string with at most 30 characters');
      }
      return true;
    }),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601 format)')
    .toDate(),

  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Tags must be an array with at most 10 items'),
];

const taskQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status filter'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority filter'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

const objectIdValidator = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format`),
];

module.exports = { createTaskValidator, updateTaskValidator, taskQueryValidator, objectIdValidator };
