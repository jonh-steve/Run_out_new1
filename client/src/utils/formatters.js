/**
 * Định dạng giá tiền theo VND
 * @param {number} price - Số tiền cần định dạng
 * @returns {string} Giá tiền đã định dạng
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Định dạng ngày theo định dạng chuẩn VN
 * @param {string|Date} date - Ngày cần định dạng
 * @returns {string} Ngày đã định dạng
 */
export const formatDate = (date) => {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Định dạng ngày giờ theo định dạng chuẩn VN
 * @param {string|Date} datetime - Ngày giờ cần định dạng
 * @returns {string} Ngày giờ đã định dạng
 */
export const formatDateTime = (datetime) => {
  const dateObj = new Date(datetime);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Rút gọn văn bản nếu quá dài
 * @param {string} text - Văn bản cần rút gọn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Văn bản đã rút gọn
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Tạo slug từ text
 * @param {string} text - Text cần chuyển đổi
 * @returns {string} Slug
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
