'use strict';

const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../../controllers/task.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createTaskValidator,
  updateTaskValidator,
  taskQueryValidator,
  objectIdValidator,
} = require('../../validators/task.validator');

// All task routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     description: Returns aggregated statistics. Admins see all tasks, users see only their own.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total: { type: integer, example: 25 }
 *                         todo: { type: integer, example: 10 }
 *                         inProgress: { type: integer, example: 8 }
 *                         done: { type: integer, example: 7 }
 *                         highPriority: { type: integer, example: 5 }
 *                         overdue: { type: integer, example: 2 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', getTaskStats);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Returns a paginated, filterable list of tasks. Admins see all tasks; users see only their own.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in-progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search on title and description
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, dueDate, priority, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', taskQueryValidator, validate, getTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a task assigned to the currently logged-in user.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implement Swagger documentation"
 *               description:
 *                 type: string
 *                 example: "Add OpenAPI 3.0 spec to all endpoints"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["backend", "docs"]
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     task: { $ref: '#/components/schemas/Task' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', createTaskValidator, validate, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Returns a single task. Users can only access their own tasks; admins can access any.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Task MongoDB ID
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     task: { $ref: '#/components/schemas/Task' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', objectIdValidator('id'), validate, getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Updates a task. Users can only update their own tasks; admins can update any.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               dueDate: { type: string, format: date }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', objectIdValidator('id'), updateTaskValidator, validate, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task. Users can only delete their own; admins can delete any.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', objectIdValidator('id'), validate, deleteTask);

module.exports = router;
