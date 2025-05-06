const rateLimit = require('express-rate-limit');
const BusinessError = require('../errors/apiError');

/**
 * Middleware giới hạn số request trong một khoảng thời gian
 * @param {Object} options - Tùy chọn cấu hình
 */
const rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn 100 request mỗi IP trong 15 phút
    message: 'Too many requests from this IP, please try again later',
  };

  const limiterOptions = { ...defaultOptions, ...options };

  return rateLimit({
    windowMs: limiterOptions.windowMs,
    max: limiterOptions.max,
    handler: (req, res, next) => {
      next(new BusinessError(limiterOptions.message, 429));
    },
  });
};

module.exports = rateLimiter;
