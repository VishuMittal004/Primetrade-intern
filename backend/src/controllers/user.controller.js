'use strict';

const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single user by ID (Admin only)
 * @route   GET /api/v1/users/:id
 * @access  Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update own profile
 * @route   PATCH /api/v1/users/profile
 * @access  Protected
 */
const updateProfile = async (req, res, next) => {
  try {
    // Only allow safe fields to be updated
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return sendError(res, 'Name must be at least 2 characters', 422);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.email}`);
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/v1/users/:id/toggle-status
 * @access  Admin
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot deactivate your own account', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`User ${user.email} status set to: ${user.isActive ? 'active' : 'inactive'} by admin ${req.user.email}`);

    return sendSuccess(
      res,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      { user }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/v1/users/:id/role
 * @access  Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Role must be either user or admin', 422);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot change your own role', 400);
    }

    user.role = role;
    await user.save();

    logger.info(`Role updated for ${user.email} → ${role} by admin ${req.user.email}`);
    return sendSuccess(res, `User role updated to ${role}`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    await User.findByIdAndDelete(req.params.id);
    logger.info(`User deleted: ${user.email} by admin ${req.user.email}`);
    return sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, toggleUserStatus, updateUserRole, deleteUser };
