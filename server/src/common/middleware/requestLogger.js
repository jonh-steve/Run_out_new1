const logger = require('../../config/logger');

/**
 * Middleware ghi log request và response
 */
const requestLogger = (req, res, next) => {
  // Lưu thời gian bắt đầu request
  req.startTime = Date.now();

  // Ghi log request
  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : 'anonymous',
  });

  // Bắt sự kiện 'finish' để ghi log sau khi request hoàn thành
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = requestLogger;
