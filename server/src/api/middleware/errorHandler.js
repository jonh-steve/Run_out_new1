/**
 * Error Handler Middleware
 * Xử lý các lỗi trong API và trả về response phù hợp
 * @author Steve
 * @project RunOut-Biliard
 */

const logger = require('../../config/logger');

/**
 * Class ApiError - Định nghĩa cấu trúc lỗi API
 */
class ApiError extends Error {
  /**
   * Khởi tạo lỗi API
   * @param {number} statusCode - Mã HTTP status
   * @param {string} message - Thông báo lỗi
   * @param {Array} errors - Danh sách lỗi chi tiết (optional)
   * @param {boolean} isOperational - Xác định lỗi là operational hay programming
   * @param {string} stack - Stack trace
   */
  constructor(statusCode, message, errors = [], isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Thêm timestamp
    this.timestamp = new Date();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Tạo lỗi 404 Not Found
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Đối tượng ApiError
   */
  static notFound(message = 'Không tìm thấy tài nguyên') {
    return new ApiError(404, message);
  }

  /**
   * Tạo lỗi 400 Bad Request
   * @param {string} message - Thông báo lỗi
   * @param {Array} errors - Danh sách lỗi chi tiết
   * @returns {ApiError} - Đối tượng ApiError
   */
  static badRequest(message = 'Yêu cầu không hợp lệ', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Tạo lỗi 401 Unauthorized
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Đối tượng ApiError
   */
  static unauthorized(message = 'Không được phép truy cập') {
    return new ApiError(401, message);
  }

  /**
   * Tạo lỗi 403 Forbidden
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Đối tượng ApiError
   */
  static forbidden(message = 'Bạn không có quyền truy cập tài nguyên này') {
    return new ApiError(403, message);
  }

  /**
   * Tạo lỗi 500 Internal Server Error
   * @param {string} message - Thông báo lỗi
   * @param {boolean} isOperational - Xác định lỗi là operational hay programming
   * @returns {ApiError} - Đối tượng ApiError
   */
  static internal(message = 'Lỗi máy chủ nội bộ', isOperational = true) {
    return new ApiError(500, message, [], isOperational);
  }

  /**
   * Tạo lỗi 422 Unprocessable Entity
   * @param {string} message - Thông báo lỗi
   * @param {Array} errors - Danh sách lỗi chi tiết
   * @returns {ApiError} - Đối tượng ApiError
   */
  static validationError(message = 'Lỗi xác thực dữ liệu', errors = []) {
    return new ApiError(422, message, errors);
  }
}

/**
 * Middleware xử lý lỗi
 * @param {Error} err - Đối tượng lỗi
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Nếu lỗi không phải là ApiError, chuyển đổi thành ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Lỗi máy chủ nội bộ';
    error = new ApiError(statusCode, message, [], false, err.stack);
  }

  // Log lỗi
  if (error.statusCode >= 500) {
    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${error.statusCode}, Message:: ${error.message}`
    );
    logger.error(error.stack);
  } else {
    logger.warn(
      `[${req.method}] ${req.path} >> StatusCode:: ${error.statusCode}, Message:: ${error.message}`
    );
  }

  // Chuẩn bị response
  const response = {
    success: false,
    status: error.statusCode,
    message: error.message,
    errors: error.errors.length > 0 ? error.errors : undefined,
    timestamp: error.timestamp,
    path: req.path,
  };

  // Trong môi trường development, thêm stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Gửi response
  res.status(error.statusCode).json(response);
};

/**
 * Middleware bắt lỗi 404 cho các routes không tồn tại
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Không tìm thấy đường dẫn: ${req.originalUrl}`);
  next(error);
};

/**
 * Middleware bắt lỗi validation từ express-validator
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const validationErrorHandler = (req, res, next) => {
  const { validationErrors } = req;

  if (validationErrors && validationErrors.length > 0) {
    const errors = validationErrors.map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    const error = ApiError.validationError('Dữ liệu không hợp lệ', errors);
    return next(error);
  }

  next();
};

/**
 * Xử lý lỗi không được bắt trong promise
 */
const setupUnhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Trong môi trường production, có thể cân nhắc tắt server hoặc xử lý graceful shutdown
    // process.exit(1);
  });
};

/**
 * Xử lý lỗi không được bắt
 */
const setupUncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Trong môi trường production, nên tắt server vì trạng thái có thể không ổn định
    // process.exit(1);
  });
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler,
};
