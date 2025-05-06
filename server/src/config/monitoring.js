// server/src/config/monitoring.js (mẫu)
const mongoose = require('mongoose');
const logger = require('./logger');

function setupMongoMonitoring() {
  // Monitor connection events
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // Monitor DB operations in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', (collection, method, query, doc) => {
      logger.debug(`MongoDB ${collection}.${method}`, { query, doc });
    });
  }
}

module.exports = { setupMongoMonitoring };
