/**
 * Response Handler Utility - định dạng chuẩn hóa cho responses
 * @author Steve
 * @project RunOut-Biliard
 */

/**
 * Gửi response thành công
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Thông báo thành công
 * @param {*} data - Dữ liệu trả về
 */
exports.sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Gửi response lỗi
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Thông báo lỗi
 * @param {Object} errors - Chi tiết lỗi (optional)
 */
exports.sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Gửi response với dữ liệu phân trang
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Thông báo
 * @param {Array} data - Dữ liệu trả về
 * @param {Object} pagination - Thông tin phân trang
 */
exports.sendPaginated = (
  res,
  statusCode = 200,
  message = 'Success',
  data = [],
  pagination = {}
) => {
  const response = {
    status: 'success',
    message,
    data,
    pagination,
  };

  res.status(statusCode).json(response);
};

/**
 * Gửi response cho created
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo
 * @param {*} data - Dữ liệu trả về
 */
exports.sendCreated = (res, message = 'Created successfully', data = null) => {
  exports.sendSuccess(res, 201, message, data);
};

/**
 * Gửi response không có nội dung
 * @param {Object} res - Express response object
 */
exports.sendNoContent = (res) => {
  res.status(204).end();
};
