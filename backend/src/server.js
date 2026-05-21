'use strict';

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});
