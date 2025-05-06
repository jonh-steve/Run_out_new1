/**
 * Lớp ApiError mở rộng từ Error để xử lý các lỗi API với mã trạng thái
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Tạo một ApiError
   * @param {number} statusCode - Mã trạng thái HTTP
   * @param {string} message - Thông báo lỗi
   * @param {object} [errors] - Các lỗi chi tiết (tùy chọn)
   */
  constructor(statusCode, message, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;

    // Ghi lại stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Chuyển đổi lỗi thành định dạng JSON
   * @returns {object} - Đối tượng lỗi dạng JSON
   */
  toJSON() {
    return {
      status: 'error',
      statusCode: this.statusCode,
      message: this.message,
      errors: Object.keys(this.errors).length > 0 ? this.errors : undefined,
    };
  }

  /**
   * Tạo một lỗi BadRequest (400)
   * @param {string} message - Thông báo lỗi
   * @param {object} [errors] - Các lỗi chi tiết (tùy chọn)
   * @returns {ApiError} - Lỗi BadRequest
   */
  static badRequest(message = 'Bad Request', errors = {}) {
    return new ApiError(400, message, errors);
  }

  /**
   * Tạo một lỗi Unauthorized (401)
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Lỗi Unauthorized
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Tạo một lỗi Forbidden (403)
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Lỗi Forbidden
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Tạo một lỗi NotFound (404)
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Lỗi NotFound
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Tạo một lỗi Conflict (409)
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Lỗi Conflict
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /**
   * Tạo một lỗi InternalServer (500)
   * @param {string} message - Thông báo lỗi
   * @returns {ApiError} - Lỗi InternalServer
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
