const mongoose = require('mongoose');

/**
 * Các hàm tiện ích cho validation
 */
const validatorUtils = {
  /**
   * Kiểm tra chuỗi có phải là email hợp lệ
   *
   * @param {String} email - Chuỗi cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Kiểm tra chuỗi có phải là số điện thoại Việt Nam hợp lệ
   *
   * @param {String} phone - Chuỗi cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isValidVietnamesePhone: (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  },

  /**
   * Kiểm tra chuỗi có phải là mật khẩu mạnh
   * Yêu cầu: ít nhất 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt
   *
   * @param {String} password - Chuỗi cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isStrongPassword: (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Kiểm tra chuỗi có phải là MongoDB ObjectId hợp lệ
   *
   * @param {String} id - Chuỗi cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isValidObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  /**
   * Kiểm tra giá trị có phải là số nguyên dương
   *
   * @param {Number} value - Giá trị cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isPositiveInteger: (value) => {
    return Number.isInteger(value) && value > 0;
  },

  /**
   * Kiểm tra giá trị có nằm trong khoảng
   *
   * @param {Number} value - Giá trị cần kiểm tra
   * @param {Number} min - Giá trị tối thiểu
   * @param {Number} max - Giá trị tối đa
   * @returns {Boolean} Kết quả kiểm tra
   */
  isInRange: (value, min, max) => {
    return value >= min && value <= max;
  },
};

module.exports = validatorUtils;
