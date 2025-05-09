/**
 * Các hàm tiện ích xử lý datetime
 */
/**
 * no-type
 * @module dateUtils
 * @description Các hàm tiện ích xử lý datetime
 * @example
 * const dateUtils = require('./dateUtils');
 * const formattedDate = dateUtils.formatDate(new Date());
 */
const dateUtils = {
  /**
   * Format date theo định dạng DD/MM/YYYY
   *
   * @param {Date} date - Date object cần format
   * @returns {String} Chuỗi đã format
   */
  formatDate: (date) => {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  },

  /**
   * Format datetime theo định dạng DD/MM/YYYY HH:MM
   *
   * @param {Date} date - Date object cần format
   * @returns {String} Chuỗi đã format
   */
  formatDateTime: (date) => {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  /**
   * Tính số ngày giữa hai ngày
   *
   * @param {Date} startDate - Ngày bắt đầu
   * @param {Date} endDate - Ngày kết thúc
   * @returns {Number} Số ngày
   */
  daysBetween: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  /**
   * Thêm số ngày vào một ngày
   *
   * @param {Date} date - Ngày gốc
   * @param {Number} days - Số ngày cần thêm
   * @returns {Date} Ngày mới
   */
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Lấy ngày đầu tiên của tháng
   *
   * @param {Date} date - Ngày bất kỳ trong tháng
   * @returns {Date} Ngày đầu tiên của tháng
   */
  firstDayOfMonth: (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },

  /**
   * Lấy ngày cuối cùng của tháng
   *
   * @param {Date} date - Ngày bất kỳ trong tháng
   * @returns {Date} Ngày cuối cùng của tháng
   */
  lastDayOfMonth: (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  },

  /**
   * Kiểm tra ngày có phải là ngày hiện tại
   *
   * @param {Date} date - Ngày cần kiểm tra
   * @returns {Boolean} Kết quả kiểm tra
   */
  isToday: (date) => {
    const today = new Date();
    const d = new Date(date);

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  },
};

module.exports = dateUtils;
