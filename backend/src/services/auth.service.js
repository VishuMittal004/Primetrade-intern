'use strict';

const User = require('../models/user.model');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { name, email, password, role } = userData;

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create user (password hashing happens in pre-save hook)
    const user = await User.create({ name, email, password, role: role || 'user' });

    logger.info(`New user registered: ${user.email} (role: ${user.role})`);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return { user, accessToken, refreshToken };
  }

  /**
   * Login a user
   */
  async login(email, password) {
    // Fetch user with password (select: false by default)
    const user = await User.findByEmail(email);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated. Contact support.');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email}`);
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    logger.info(`User logged in: ${user.email}`);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Remove password from returned object
    user.password = undefined;

    return { user, accessToken, refreshToken };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);
    return true;
  }
}

module.exports = new AuthService();
