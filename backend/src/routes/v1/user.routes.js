'use strict';

const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateProfile,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
} = require('../../controllers/user.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { objectIdValidator } = require('../../validators/task.validator');

// All user routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: Update own profile
 *     description: Allows any authenticated user to update their display name.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/profile', updateProfile);

// ─── Admin-only routes below ──────────────────────────────────────────────────
router.use(authorize('admin'));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Returns a paginated list of all users. Requires admin role.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Results per page
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB user ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', objectIdValidator('id'), validate, getUserById);

/**
 * @swagger
 * /api/v1/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active/inactive status (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status toggled
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/toggle-status', objectIdValidator('id'), validate, toggleUserStatus);

/**
 * @swagger
 * /api/v1/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id/role', objectIdValidator('id'), validate, updateUserRole);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', objectIdValidator('id'), validate, deleteUser);

module.exports = router;
