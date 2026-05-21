'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Task = require('../models/task.model');
const logger = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow_db';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@taskflow.dev',
    password: 'Admin123',
    role: 'admin',
  },
  {
    name: 'Alice Johnson',
    email: 'alice@taskflow.dev',
    password: 'Alice123',
    role: 'user',
  },
  {
    name: 'Bob Smith',
    email: 'bob@taskflow.dev',
    password: 'Bobby123',
    role: 'user',
  },
];

const seedTasks = (userId) => [
  {
    title: 'Set up project repository',
    description: 'Initialize Git repo, set up branches, and configure CI/CD pipeline',
    status: 'done',
    priority: 'high',
    tags: ['setup', 'devops'],
    owner: userId,
  },
  {
    title: 'Design database schema',
    description: 'Create ERD and define MongoDB collections for users, tasks, and auth tokens',
    status: 'done',
    priority: 'high',
    tags: ['database', 'architecture'],
    owner: userId,
  },
  {
    title: 'Implement JWT authentication',
    description: 'Add JWT-based login/register with bcrypt password hashing and refresh tokens',
    status: 'in-progress',
    priority: 'high',
    tags: ['backend', 'security', 'auth'],
    owner: userId,
  },
  {
    title: 'Build CRUD endpoints for Tasks',
    description: 'Create, read, update, and delete endpoints with validation and ownership checks',
    status: 'in-progress',
    priority: 'medium',
    tags: ['backend', 'api'],
    owner: userId,
  },
  {
    title: 'Write Swagger documentation',
    description: 'Document all API endpoints with OpenAPI 3.0 spec including request/response examples',
    status: 'todo',
    priority: 'medium',
    tags: ['docs', 'api'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    owner: userId,
  },
  {
    title: 'Build React frontend',
    description: 'Create login, register, dashboard, and CRUD interface connected to the API',
    status: 'todo',
    priority: 'high',
    tags: ['frontend', 'react'],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    owner: userId,
  },
  {
    title: 'Add rate limiting and security headers',
    description: 'Integrate Helmet, express-rate-limit, and CORS configuration',
    status: 'todo',
    priority: 'medium',
    tags: ['security', 'backend'],
    owner: userId,
  },
  {
    title: 'Write unit and integration tests',
    description: 'Test all API endpoints using Jest and Supertest with at least 80% coverage',
    status: 'todo',
    priority: 'low',
    tags: ['testing', 'quality'],
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    owner: userId,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const createdUsers = await User.create(seedUsers);
    logger.info(`Created ${createdUsers.length} users`);

    // Create tasks for alice (index 1)
    const alice = createdUsers[1];
    const aliceTasks = await Task.create(seedTasks(alice._id));
    logger.info(`Created ${aliceTasks.length} tasks for Alice`);

    // Create a couple tasks for bob
    const bob = createdUsers[2];
    await Task.create([
      {
        title: 'Review pull requests',
        description: 'Review and approve team PRs for the sprint',
        status: 'todo',
        priority: 'high',
        tags: ['review', 'collaboration'],
        owner: bob._id,
      },
      {
        title: 'Update API documentation',
        description: 'Keep Swagger docs in sync with latest endpoints',
        status: 'in-progress',
        priority: 'medium',
        tags: ['docs'],
        owner: bob._id,
      },
    ]);
    logger.info('Created 2 tasks for Bob');

    console.log('\n✅ Seed completed successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('📧 Seeded Accounts:');
    console.log('  Admin:  admin@taskflow.dev  / Admin123');
    console.log('  User:   alice@taskflow.dev  / Alice123');
    console.log('  User:   bob@taskflow.dev    / Bobby123');
    console.log('─────────────────────────────────────────\n');
  } catch (error) {
    logger.error('Seed failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
