const ApiError = require('../errors/apiError');
const logger = require('../../config/logger');

/**
 * Middleware xử lý lỗi toàn cục
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Nếu lỗi không phải là instance của ApiError, chuyển đổi thành ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Ghi log lỗi
  if (error.statusCode >= 500) {
    logger.error(error);
  } else {
    logger.warn(`${error.statusCode} - ${error.message}`);
  }

  // Phản hồi cho client
  const response = {
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  // Thêm errors vào response nếu là ValidationError
  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(error.statusCode).json(response);
  next();
};

module.exports = errorHandler;
