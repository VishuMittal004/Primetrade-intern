'use strict';

const taskService = require('../services/task.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

/**
 * @desc    Create a new task
 * @route   POST /api/v1/tasks
 * @access  Protected
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.create(req.body, req.user._id);
    return sendCreated(res, 'Task created successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks (with filtering + pagination)
 * @route   GET /api/v1/tasks
 * @access  Protected (admin sees all, user sees own)
 */
const getTasks = async (req, res, next) => {
  try {
    const result = await taskService.getAll({ user: req.user, query: req.query });
    return sendSuccess(res, 'Tasks fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task statistics
 * @route   GET /api/v1/tasks/stats
 * @access  Protected
 */
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await taskService.getStats(req.user);
    return sendSuccess(res, 'Task statistics fetched', { stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Protected (owner or admin)
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.id, req.user);
    return sendSuccess(res, 'Task fetched successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/v1/tasks/:id
 * @access  Protected (owner or admin)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Task updated successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Protected (owner or admin)
 */
const deleteTask = async (req, res, next) => {
  try {
    await taskService.delete(req.params.id, req.user);
    return sendSuccess(res, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTaskStats, getTaskById, updateTask, deleteTask };
