/**
 * Validator Utilities - Các hàm hỗ trợ validate dữ liệu
 * @author Steve
 * @project RunOut-Biliard
 */

const mongoose = require('mongoose');

/**
 * Kiểm tra ID MongoDB hợp lệ
 * @param {string} id - ID cần kiểm tra
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
exports.isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
exports.isValidVNPhone = (phone) => {
  return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone);
};

/**
 * Kiểm tra mật khẩu đủ mạnh
 * Yêu cầu:
 * - Ít nhất 8 ký tự
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 chữ thường
 * - Có ít nhất 1 chữ số
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
exports.isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Mã hóa một chuỗi thành slug
 * @param {string} text - Chuỗi cần mã hóa
 * @returns {string} - Slug đã tạo
 */
exports.slugify = (text) => {
  return text
    .toString()
    .normalize('NFD') // tách dấu thành các ký tự riêng biệt
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // thay khoảng trắng bằng dấu gạch
    .replace(/[^\w-]+/g, '') // loại bỏ các ký tự đặc biệt
    .replace(/--+/g, '-'); // thay nhiều dấu gạch liên tiếp bằng một dấu
};

/**
 * Loại bỏ dấu tiếng Việt
 * @param {string} str - Chuỗi cần xử lý
 * @returns {string} - Chuỗi đã loại bỏ dấu
 */
exports.removeVietnameseAccents = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Kiểm tra một giá trị có thuộc một enum không
 * @param {*} value - Giá trị cần kiểm tra
 * @param {Array} enumValues - Mảng các giá trị hợp lệ
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
exports.isInEnum = (value, enumValues) => {
  return enumValues.includes(value);
};

/**
 * Tạo một mã ngẫu nhiên
 * @param {number} length - Độ dài mã
 * @returns {string} - Mã ngẫu nhiên
 */
exports.generateRandomCode = (length = 6) => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

/**
 * Chuẩn hóa số điện thoại về định dạng 0xxxxxxxxx
 * @param {string} phone - Số điện thoại cần chuẩn hóa
 * @returns {string} - Số điện thoại đã chuẩn hóa
 */
exports.normalizePhone = (phone) => {
  if (!phone) return '';

  // Loại bỏ các ký tự không phải số
  let normalized = phone.replace(/\D/g, '');

  // Đổi +84 thành 0
  if (normalized.startsWith('84')) {
    normalized = '0' + normalized.substring(2);
  }

  return normalized;
};
