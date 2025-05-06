/**
 * Utility wrapper để xử lý lỗi async cho controllers
 * @author Steve
 * @project RunOut-Biliard
 */

/**
 * Bọc hàm async để xử lý lỗi mà không cần try-catch trong mỗi controller
 * @param {Function} fn - Hàm async cần được bọc
 * @returns {Function} - Middleware function với xử lý lỗi
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
