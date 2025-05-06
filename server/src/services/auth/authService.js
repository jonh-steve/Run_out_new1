/**
 * Auth Service - xử lý logic xác thực và phân quyền
 * @author Steve
 * @project RunOut-Biliard
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../data/models/user.model');
const { ApiError } = require('../../common/errors/apiError');
const logger = require('../../config/logger');
const environment = require('../../config/environment');
const { sendEmail } = require('../email/emailService');

/**
 * Class AuthService xử lý logic xác thực và phân quyền
 */
class AuthService {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin đăng ký
   * @param {string} host - Host để tạo URL xác thực
   * @returns {Promise<Object>} - Thông tin người dùng đã tạo
   */
  async register(userData, host) {
    try {
      const { name, email, password, phone } = userData;

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(409, 'Email đã được sử dụng');
      }

      // Tạo verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      // Tạo user mới
      const newUser = await User.create({
        name,
        email,
        password,
        phone,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 giờ
      });

      // Tạo URL xác thực
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const verifyURL = `${protocol}://${host}/api/auth/verify-email/${verificationToken}`;

      // Gửi email xác thực
      await sendEmail({
        to: email,
        subject: 'Xác thực tài khoản RunOut-Biliard',
        template: 'verification',
        context: {
          name,
          verifyURL,
        },
      });

      // Không gửi mật khẩu và token trong response
      const userObj = newUser.toObject();
      delete userObj.password;
      delete userObj.emailVerificationToken;

      return userObj;
    } catch (error) {
      logger.error(`Lỗi đăng ký: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đăng nhập
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} - Thông tin người dùng và token
   */
  async login(email, password) {
    try {
      // Tìm user và lấy cả password (mặc định password bị loại trừ)
      const user = await User.findOne({ email }).select('+password');

      // Kiểm tra user tồn tại và password đúng
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
      }

      // Kiểm tra email đã xác thực chưa
      if (!user.emailVerified) {
        throw new ApiError(401, 'Vui lòng xác thực email trước khi đăng nhập');
      }

      // Kiểm tra user có active không
      if (!user.isActive) {
        throw new ApiError(401, 'Tài khoản của bạn đã bị vô hiệu hóa');
      }

      // Tạo JWT token và refresh token
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Cập nhật thông tin đăng nhập
      user.lastLogin = Date.now();
      user.loginCount += 1;
      await user.save({ validateBeforeSave: false });

      // Chuyển đổi user thành object và loại bỏ password
      const userObj = user.toObject();
      delete userObj.password;

      return {
        user: userObj,
        token,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Lỗi đăng nhập: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, environment.auth.jwtSecret, {
      expiresIn: environment.auth.jwtExpiresIn,
    });
  }

  /**
   * Tạo refresh token
   * @param {Object} user - User object
   * @returns {string} - Refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign({ id: user._id }, environment.auth.jwtRefreshSecret, {
      expiresIn: environment.auth.jwtRefreshExpiresIn,
    });
  }

  /**
   * Làm mới token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Token mới
   */
  async refreshToken(refreshToken) {
    try {
      // Xác thực refresh token
      const decoded = jwt.verify(refreshToken, environment.auth.jwtRefreshSecret);

      // Tìm user
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new ApiError(401, 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
      }

      // Tạo token mới
      const newToken = this.generateToken(user);

      return { token: newToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
      }

      logger.error(`Lỗi refresh token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Quên mật khẩu
   * @param {string} email - Email người dùng
   * @param {string} host - Host để tạo URL reset
   * @returns {Promise<boolean>} - Thành công hay không
   */
  async forgotPassword(email, host) {
    try {
      // Tìm user theo email
      const user = await User.findOne({ email });

      if (!user) {
        throw new ApiError(404, 'Không tìm thấy người dùng với email này');
      }

      // Tạo reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Lưu token và thời hạn vào database
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút
      await user.save({ validateBeforeSave: false });

      // Tạo URL reset
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const resetURL = `${protocol}://${host}/reset-password/${resetToken}`;

      // Gửi email
      await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu RunOut-Biliard (có hiệu lực trong 10 phút)',
        template: 'resetPassword',
        context: {
          name: user.name,
          resetURL,
        },
      });

      return true;
    } catch (error) {
      logger.error(`Lỗi quên mật khẩu: ${error.message}`);

      // Nếu gửi email thất bại, xóa các fields reset
      if (error.message.includes('email')) {
        try {
          const user = await User.findOne({ email });
          if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
          }
        } catch (innerError) {
          logger.error(`Lỗi khi xóa token reset: ${innerError.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu
   * @param {string} token - Reset token
   * @param {string} password - Mật khẩu mới
   * @returns {Promise<Object>} - Thông tin người dùng và token
   */
  async resetPassword(token, password) {
    try {
      // Hash token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Tìm user với token và kiểm tra thời hạn
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      // Kiểm tra nếu token hợp lệ
      if (!user) {
        throw new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn');
      }

      // Cập nhật mật khẩu
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Tạo token mới
      const jwtToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Chuyển đổi user thành object và loại bỏ password
      const userObj = user.toObject();
      delete userObj.password;

      return {
        user: userObj,
        token: jwtToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Lỗi đặt lại mật khẩu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xác thực email
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} - Thành công hay không
   */
  async verifyEmail(token) {
    try {
      // Hash token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Tìm user và kiểm tra thời hạn
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      });

      // Kiểm tra nếu token hợp lệ
      if (!user) {
        throw new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn');
      }

      // Cập nhật trạng thái xác thực
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return true;
    } catch (error) {
      logger.error(`Lỗi xác thực email: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new AuthService();
