'use strict';

const Task = require('../models/task.model');
const logger = require('../utils/logger');
const { buildPagination } = require('../utils/response');

class TaskService {
  /**
   * Create a new task
   */
  async create(data, ownerId) {
    const task = await Task.create({ ...data, owner: ownerId });
    await task.populate('owner', 'name email');
    logger.info(`Task created: "${task.title}" by user ${ownerId}`);
    return task;
  }

  /**
   * Get all tasks with filtering, sorting, and pagination
   * Admins see all tasks; users see only their own
   */
  async getAll({ user, query }) {
    const { status, priority, search, tags, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = query;

    const filter = {};

    // Scope to owner unless admin
    if (user.role !== 'admin') {
      filter.owner = user._id;
    }

    // Filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'].includes(sortBy)
      ? sortBy
      : 'createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email'),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: buildPagination(total, pageNum, limitNum),
    };
  }

  /**
   * Get a single task by ID with ownership check
   */
  async getById(taskId, user) {
    const task = await Task.findById(taskId).populate('owner', 'name email');

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Non-admins can only view their own tasks
    if (user.role !== 'admin' && task.owner._id.toString() !== user._id.toString()) {
      const error = new Error('You are not authorized to view this task');
      error.statusCode = 403;
      throw error;
    }

    return task;
  }

  /**
   * Update a task with ownership check
   */
  async update(taskId, data, user) {
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Non-admins can only update their own tasks
    if (user.role !== 'admin' && task.owner.toString() !== user._id.toString()) {
      const error = new Error('You are not authorized to update this task');
      error.statusCode = 403;
      throw error;
    }

    // Apply updates
    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        task[field] = data[field];
      }
    });

    await task.save();
    await task.populate('owner', 'name email');

    logger.info(`Task updated: "${task.title}" (id: ${taskId})`);
    return task;
  }

  /**
   * Delete a task with ownership check
   */
  async delete(taskId, user) {
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Non-admins can only delete their own tasks
    if (user.role !== 'admin' && task.owner.toString() !== user._id.toString()) {
      const error = new Error('You are not authorized to delete this task');
      error.statusCode = 403;
      throw error;
    }

    await Task.findByIdAndDelete(taskId);
    logger.info(`Task deleted: "${task.title}" (id: ${taskId}) by user ${user._id}`);
    return true;
  }

  /**
   * Get task statistics for the current user (or all for admin)
   */
  async getStats(user) {
    const filter = user.role === 'admin' ? {} : { owner: user._id };

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] },
                    { $ne: ['$dueDate', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return stats[0] || { total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, overdue: 0 };
  }
}

module.exports = new TaskService();
