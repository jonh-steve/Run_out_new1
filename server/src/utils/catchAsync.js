/**
 * Wrapper function để bắt lỗi trong các hàm async
 * Tránh việc phải sử dụng try/catch nhiều lần
 *
 * @param {Function} fn - Async function cần bọc
 * @returns {Function} Middleware function với lỗi đã được xử lý
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
