/**
 * Authentication Middleware
 * Xử lý xác thực và phân quyền cho API endpoints
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../../common/utils/catchAsync');
const { responseHandler } = require('../../common/utils/responseHandler');
const userService = require('../../services/user/userService');
const config = require('../../config/environment');

const authMiddleware = {
  /**
   * Xác thực người dùng qua JWT token
   * Token được cung cấp qua header Authorization
   */
  authenticate: catchAsync(async (req, res, next) => {
    // 1) Lấy token và kiểm tra nếu tồn tại
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return responseHandler.unauthorized(res, 'Vui lòng đăng nhập để truy cập');
    }

    // 2) Xác thực token
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

    // 3) Kiểm tra nếu người dùng vẫn tồn tại
    const user = await userService.getUserById(decoded.id);
    if (!user) {
      return responseHandler.unauthorized(res, 'Người dùng không còn tồn tại');
    }

    // 4) Kiểm tra nếu người dùng đã thay đổi mật khẩu sau khi token được cấp
    if (user.changedPasswordAfter(decoded.iat)) {
      return responseHandler.unauthorized(res, 'Mật khẩu đã thay đổi, vui lòng đăng nhập lại');
    }

    // Lưu thông tin người dùng vào request
    req.user = user;
    next();
  }),

  /**
   * Giới hạn quyền truy cập dựa trên vai trò người dùng
   * @param {...string} roles - Các vai trò được phép truy cập
   */
  restrictTo: (...roles) => {
    return (req, res, next) => {
      // Kiểm tra nếu vai trò của người dùng nằm trong danh sách được phép
      if (!roles.includes(req.user.role)) {
        return responseHandler.forbidden(res, 'Bạn không có quyền thực hiện hành động này');
      }
      next();
    };
  },

  /**
   * Kiểm tra xem người dùng đã xác thực email chưa
   */
  isEmailVerified: (req, res, next) => {
    if (!req.user.emailVerified) {
      return responseHandler.forbidden(res, 'Vui lòng xác thực email của bạn trước');
    }
    next();
  },

  /**
   * Kiểm tra nếu người dùng đang truy cập dữ liệu của chính họ
   * hoặc là admin
   */
  isOwnerOrAdmin: (userIdPath) => {
    return (req, res, next) => {
      const userId = userIdPath.split('.').reduce((obj, prop) => obj[prop], req);

      // Cho phép nếu là admin hoặc chủ sở hữu
      if (req.user.role === 'admin' || req.user.id === userId) {
        return next();
      }

      return responseHandler.forbidden(res, 'Bạn không có quyền truy cập dữ liệu này');
    };
  },
};

module.exports = {
  authenticate: authMiddleware.authenticate,
  restrictTo: authMiddleware.restrictTo,
  isEmailVerified: authMiddleware.isEmailVerified,
  isOwnerOrAdmin: authMiddleware.isOwnerOrAdmin,
};
