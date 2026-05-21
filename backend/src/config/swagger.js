'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow REST API',
      version: '1.0.0',
      description: `
## TaskFlow API — Production-Ready REST API

A scalable REST API with JWT authentication, role-based access control (RBAC), and full CRUD operations for task management.

### Features
- **JWT Authentication** with refresh token support
- **Role-Based Access Control** (user/admin roles)
- **Full CRUD** for Tasks module
- **Input Validation** on all endpoints
- **Rate Limiting** & security headers

### Authentication Flow
1. Register a new account via \`POST /api/v1/auth/register\`
2. Login via \`POST /api/v1/auth/login\` — receive a JWT token
3. Include the token in the \`Authorization\` header as \`Bearer <token>\`
4. Access protected routes

### Roles
- **user** — Can manage their own tasks and profile
- **admin** — Can access all users, all tasks, and admin routes
      `,
      contact: {
        name: 'TaskFlow Support',
        email: 'support@taskflow.dev',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
      {
        url: 'https://api.taskflow.dev',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f78901235' },
            title: { type: 'string', example: 'Implement JWT authentication' },
            description: { type: 'string', example: 'Add JWT-based auth to the API' },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'done'],
              example: 'todo',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high',
            },
            dueDate: { type: 'string', format: 'date', example: '2024-12-31' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['backend', 'security'],
            },
            owner: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email is required' },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Tasks fetched successfully' },
            data: {
              type: 'object',
              properties: {
                tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 50 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    totalPages: { type: 'integer', example: 5 },
                    hasNextPage: { type: 'boolean', example: true },
                    hasPrevPage: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Not authorized, token failed' },
            },
          },
        },
        ForbiddenError: {
          description: 'You do not have permission to perform this action',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Access denied: insufficient permissions' },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Resource not found' },
            },
          },
        },
        ValidationError: {
          description: 'Input validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints — register, login, logout' },
      { name: 'Users', description: 'User profile and admin user management' },
      { name: 'Tasks', description: 'Task CRUD operations with filtering and pagination' },
    ],
  },
  apis: ['./src/routes/v1/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
