const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Các hàm tiện ích liên quan đến bảo mật
 */
const securityUtils = {
  /**
   * Hash mật khẩu sử dụng bcrypt
   *
   * @param {String} password - Mật khẩu cần hash
   * @returns {Promise<String>} Mật khẩu đã hash
   */
  hashPassword: async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  /**
   * So sánh mật khẩu với hash
   *
   * @param {String} password - Mật khẩu cần kiểm tra
   * @param {String} hash - Hash đã lưu
   * @returns {Promise<Boolean>} Kết quả so sánh
   */
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Tạo JWT token
   *
   * @param {Object} payload - Dữ liệu cần lưu trong token
   * @param {String} secret - Secret key
   * @param {Object} options - Tùy chọn cho token
   * @returns {String} JWT token
   */
  generateToken: (payload, secret, options = {}) => {
    return jwt.sign(payload, secret, options);
  },

  /**
   * Xác thực và decode JWT token
   *
   * @param {String} token - JWT token
   * @param {String} secret - Secret key
   * @returns {Object} Payload đã decode
   */
  verifyToken: (token, secret) => {
    return jwt.verify(token, secret);
  },

  /**
   * Tạo chuỗi random để làm reset token, verification token...
   *
   * @param {Number} length - Độ dài chuỗi (mặc định: 32)
   * @returns {String} Chuỗi random
   */
  generateRandomToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Hash một chuỗi sử dụng SHA-256
   *
   * @param {String} data - Chuỗi cần hash
   * @returns {String} Chuỗi đã hash
   */
  hashData: (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Mã hóa dữ liệu
   *
   * @param {String} data - Dữ liệu cần mã hóa
   * @param {String} secret - Secret key
   * @returns {String} Dữ liệu đã mã hóa
   */
  encrypt: (data, secret) => {
    const algorithm = 'aes-256-ctr';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secret, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  },

  /**
   * Giải mã dữ liệu
   *
   * @param {String} encryptedData - Dữ liệu đã mã hóa
   * @param {String} secret - Secret key
   * @returns {String} Dữ liệu đã giải mã
   */
  decrypt: (encryptedData, secret) => {
    const algorithm = 'aes-256-ctr';
    const [ivHex, encrypted] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secret, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};

module.exports = securityUtils;
