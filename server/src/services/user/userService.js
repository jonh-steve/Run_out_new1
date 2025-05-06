/**
 * User Service - xử lý logic quản lý người dùng
 * @author Steve
 * @project RunOut-Biliard
 */

const User = require('../../data/models/user.model');
const BaseService = require('../base/baseService');
const { ApiError } = require('../../api/middleware/errorHandler');
const logger = require('../../config/logger');

/**
 * Class UserService xử lý logic quản lý người dùng
 * Kế thừa từ BaseService để có các phương thức CRUD cơ bản
 */
class UserService extends BaseService {
  constructor() {
    super(User, 'User');
  }

  /**
   * Tạo người dùng mới
   * @override
   * @param {Object} userData - Thông tin người dùng
   * @returns {Promise<Object>} - Người dùng đã tạo
   */
  async create(userData) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError(409, 'Email đã được sử dụng');
      }

      // Người dùng được tạo bởi admin mặc định đã xác thực email
      const newUserData = {
        ...userData,
        emailVerified: true,
      };

      // Tạo người dùng mới
      const newUser = await super.create(newUserData);

      // Loại bỏ password khỏi response
      const userObj = newUser.toObject();
      delete userObj.password;

      return userObj;
    } catch (error) {
      logger.error(`Lỗi tạo người dùng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @override
   * @param {string} id - ID người dùng
   * @param {Object} updateData - Thông tin cập nhật
   * @param {Object} options - Tùy chọn
   * @returns {Promise<Object>} - Người dùng đã cập nhật
   */
  async update(id, updateData, options = {}) {
    try {
      // Tạo bản sao của đối tượng updateData
      const safeUpdateData = { ...updateData };

      // Danh sách các trường nhạy cảm cần loại bỏ
      const sensitiveFields = [
        'password',
        'emailVerified',
        'loginCount',
        'lastLogin',
        'resetPasswordToken',
        'resetPasswordExpires',
        'emailVerificationToken',
        'emailVerificationExpires',
      ];

      // Loại bỏ các trường nhạy cảm
      sensitiveFields.forEach((field) => {
        delete safeUpdateData[field];
      });

      // Xử lý riêng trường role
      const { role } = updateData;
      delete safeUpdateData.role;

      // Admin có thể cập nhật role
      if (options.isAdmin && role) {
        safeUpdateData.role = role;
      }

      // Cập nhật thông tin người dùng
      const updatedUser = await super.update(id, safeUpdateData);

      return updatedUser;
    } catch (error) {
      logger.error(`Lỗi cập nhật người dùng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Thay đổi mật khẩu
   * @param {string} userId - ID người dùng
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Object>} - Người dùng đã cập nhật
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Lấy user với password
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new ApiError(404, 'Người dùng không tồn tại');
      }

      // Kiểm tra mật khẩu hiện tại
      if (!(await user.correctPassword(currentPassword, user.password))) {
        throw new ApiError(401, 'Mật khẩu hiện tại không đúng');
      }

      // Cập nhật mật khẩu
      user.password = newPassword;
      await user.save();

      // Loại bỏ password khỏi response
      const userObj = user.toObject();
      delete userObj.password;

      return userObj;
    } catch (error) {
      logger.error(`Lỗi thay đổi mật khẩu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vô hiệu hóa tài khoản
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object>} - Người dùng đã cập nhật
   */
  async deactivateUser(userId) {
    try {
      const user = await this.findById(userId);

      // Cập nhật trạng thái active
      user.isActive = false;
      await user.save({ validateBeforeSave: false });

      return user;
    } catch (error) {
      logger.error(`Lỗi vô hiệu hóa tài khoản: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kích hoạt lại tài khoản
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object>} - Người dùng đã cập nhật
   */
  async activateUser(userId) {
    try {
      const user = await this.findById(userId);

      // Cập nhật trạng thái active
      user.isActive = true;
      await user.save({ validateBeforeSave: false });

      return user;
    } catch (error) {
      logger.error(`Lỗi kích hoạt tài khoản: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm kiếm người dùng với các tiêu chí nâng cao
   * @param {Object} criteria - Tiêu chí tìm kiếm
   * @param {Object} options - Tùy chọn (pagination, sort)
   * @returns {Promise<Object>} - Kết quả tìm kiếm với phân trang
   */
  async search(criteria, options = {}) {
    try {
      const filter = {};

      // Xử lý các tiêu chí tìm kiếm
      if (criteria.name) {
        filter.name = { $regex: criteria.name, $options: 'i' };
      }

      if (criteria.email) {
        filter.email = { $regex: criteria.email, $options: 'i' };
      }

      if (criteria.phone) {
        filter.phone = { $regex: criteria.phone, $options: 'i' };
      }

      if (criteria.role) {
        filter.role = criteria.role;
      }

      if (criteria.isActive !== undefined) {
        filter.isActive = criteria.isActive;
      }

      if (criteria.emailVerified !== undefined) {
        filter.emailVerified = criteria.emailVerified;
      }

      // Tìm kiếm kết hợp theo text
      if (criteria.search) {
        filter.$or = [
          { name: { $regex: criteria.search, $options: 'i' } },
          { email: { $regex: criteria.search, $options: 'i' } },
          { phone: { $regex: criteria.search, $options: 'i' } },
        ];
      }

      // Tìm kiếm theo khoảng thời gian đăng ký
      if (criteria.createdFrom || criteria.createdTo) {
        filter.createdAt = {};

        if (criteria.createdFrom) {
          filter.createdAt.$gte = new Date(criteria.createdFrom);
        }

        if (criteria.createdTo) {
          filter.createdAt.$lte = new Date(criteria.createdTo);
        }
      }

      // Lấy kết quả với phân trang
      return await this.findAll(filter, {
        ...options,
        select: '-password',
      });
    } catch (error) {
      logger.error(`Lỗi tìm kiếm người dùng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa người dùng và dữ liệu liên quan
   * @override
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object>} - Thông tin người dùng đã xóa
   */
  async delete(userId) {
    try {
      // Xóa dữ liệu liên quan đến người dùng trước (nếu cần)
      // TODO: Xóa dữ liệu liên quan như giỏ hàng, đơn hàng, đánh giá

      // Xóa người dùng
      const user = await super.delete(userId);

      return user;
    } catch (error) {
      logger.error(`Lỗi xóa người dùng: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new UserService();
