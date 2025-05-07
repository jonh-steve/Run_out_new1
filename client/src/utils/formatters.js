/**
 * Định dạng giá tiền theo loại tiền tệ
 * @param {number} price - Số tiền cần định dạng
 * @param {string} locale - Ngôn ngữ hiển thị (mặc định: 'vi-VN')
 * @param {string} currency - Loại tiền tệ (mặc định: 'VND')
 * @returns {string} Giá tiền đã định dạng
 */
export const formatPrice = (price, locale = 'vi-VN', currency = 'VND') => {
  if (price === null || price === undefined) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(price);
  } catch (error) {
    console.error('Lỗi khi định dạng giá tiền:', error);
    return `${price} ${currency}`;
  }
};

/**
 * Định dạng ngày theo định dạng chuẩn
 * @param {string|Date} date - Ngày cần định dạng
 * @param {string} locale - Ngôn ngữ hiển thị (mặc định: 'vi-VN')
 * @param {object} options - Tùy chọn định dạng (mặc định: hiển thị đầy đủ ngày tháng)
 * @returns {string} Ngày đã định dạng
 */
export const formatDate = (date, locale = 'vi-VN', options = null) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Kiểm tra ngày hợp lệ
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const defaultOptions = options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('Lỗi khi định dạng ngày:', error);
    return String(date);
  }
};

/**
 * Định dạng thời gian
 * @param {string|Date} date - Thời gian cần định dạng
 * @param {string} locale - Ngôn ngữ hiển thị (mặc định: 'vi-VN')
 * @returns {string} Thời gian đã định dạng
 */
export const formatTime = (date, locale = 'vi-VN') => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Kiểm tra ngày hợp lệ
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Lỗi khi định dạng thời gian:', error);
    return '';
  }
};

/**
 * Định dạng ngày giờ đầy đủ
 * @param {string|Date} datetime - Ngày giờ cần định dạng
 * @param {string} locale - Ngôn ngữ hiển thị (mặc định: 'vi-VN')
 * @returns {string} Ngày giờ đã định dạng
 */
export const formatDateTime = (datetime, locale = 'vi-VN') => {
  if (!datetime) return '';

  try {
    return `${formatDate(datetime, locale)}, ${formatTime(datetime, locale)}`;
  } catch (error) {
    console.error('Lỗi khi định dạng ngày giờ:', error);
    return String(datetime);
  }
};

/**
 * Rút gọn văn bản nếu quá dài
 * @param {string} text - Văn bản cần rút gọn
 * @param {number} maxLength - Độ dài tối đa (mặc định: 100)
 * @returns {string} Văn bản đã rút gọn
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + '...';
};

/**
 * Tạo slug từ text
 * @param {string} text - Text cần chuyển đổi
 * @returns {string} Slug
 */
export const createSlug = (text) => {
  if (!text) return '';

  try {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  } catch (error) {
    console.error('Lỗi khi tạo slug:', error);
    return '';
  }
};

/**
 * Định dạng số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại cần định dạng
 * @returns {string} Số điện thoại đã định dạng
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');

  // Kiểm tra độ dài số điện thoại Việt Nam
  if (cleaned.length !== 10) {
    return phone;
  }

  // Định dạng: 0xx xxxx xxx
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
};

/**
 * Định dạng số lượng lớn (ví dụ: 1.5k thay vì 1500)
 * @param {number} number - Số cần định dạng
 * @returns {string} Số đã định dạng
 */
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined) return '';

  const formatter = new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
  });

  return formatter.format(number);
};
