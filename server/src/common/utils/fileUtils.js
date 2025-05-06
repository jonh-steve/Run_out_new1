const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

// Promisify fs functions
const unlinkAsync = util.promisify(fs.unlink);
const mkdirAsync = util.promisify(fs.mkdir);
const statAsync = util.promisify(fs.stat);

/**
 * Các hàm tiện ích xử lý file
 */
const fileUtils = {
  /**
   * Kiểm tra một file có tồn tại
   *
   * @param {String} filePath - Đường dẫn file
   * @returns {Promise<Boolean>} Kết quả kiểm tra
   */
  fileExists: async (filePath) => {
    try {
      await statAsync(filePath);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Tạo thư mục nếu chưa tồn tại
   *
   * @param {String} dirPath - Đường dẫn thư mục
   * @returns {Promise<void>}
   */
  ensureDirectoryExists: async (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      await mkdirAsync(dirPath, { recursive: true });
    }
  },

  /**
   * Xóa một file
   *
   * @param {String} filePath - Đường dẫn file
   * @returns {Promise<void>}
   */
  removeFile: async (filePath) => {
    if (await fileUtils.fileExists(filePath)) {
      await unlinkAsync(filePath);
    }
  },

  /**
   * Lấy extension của file
   *
   * @param {String} filename - Tên file
   * @returns {String} Extension của file
   */
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  /**
   * Kiểm tra file có phải là hình ảnh
   *
   * @param {String} filename - Tên file
   * @returns {Boolean} Kết quả kiểm tra
   */
  isImageFile: (filename) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = fileUtils.getFileExtension(filename);
    return validExtensions.includes(extension);
  },

  /**
   * Tạo tên file ngẫu nhiên
   *
   * @param {String} originalname - Tên file gốc
   * @returns {String} Tên file mới
   */
  generateUniqueFilename: (originalname) => {
    const extension = fileUtils.getFileExtension(originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}${extension}`;
  },

  /**
   * Tính kích thước file theo định dạng readable
   *
   * @param {Number} bytes - Kích thước file tính bằng bytes
   * @returns {String} Kích thước file dạng readable
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

module.exports = fileUtils;
