'use strict';

const authService = require('../services/auth.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return sendCreated(res, 'Account created successfully', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return sendSuccess(res, 'Logged in successfully', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/v1/auth/logout
 * @access  Protected
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken');
    logger.info(`User logged out: ${req.user?.email}`);
    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's profile
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return sendSuccess(res, 'Profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Protected
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, changePassword };
