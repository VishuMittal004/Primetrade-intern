'use strict';

const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        printf(({ level, message, timestamp: ts, stack }) => {
          return `${ts} ${level}: ${stack || message}`;
        })
      ),
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') }),
  ],
});

// Add HTTP level for morgan
logger.http = (message) => logger.log('http', message);

module.exports = logger;
