/**
 * Các hàm tiện ích định dạng dữ liệu
 */
const formatters = {
  /**
   * Định dạng số tiền
   *
   * @param {Number} amount - Số tiền cần định dạng
   * @param {String} currency - Đơn vị tiền tệ (mặc định: VND)
   * @returns {String} Chuỗi đã định dạng
   */
  formatCurrency: (amount, currency = 'VND') => {
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });

    return formatter.format(amount);
  },

  /**
   * Định dạng số điện thoại Việt Nam
   *
   * @param {String} phone - Số điện thoại cần định dạng
   * @returns {String} Số điện thoại đã định dạng
   */
  formatPhoneNumber: (phone) => {
    if (!phone) return '';

    // Loại bỏ tất cả ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');

    // Kiểm tra độ dài
    if (cleaned.length !== 10) return phone;

    // Định dạng: XXX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  },

  /**
   * Định dạng địa chỉ
   *
   * @param {Object} address - Object chứa thông tin địa chỉ
   * @returns {String} Địa chỉ đã định dạng
   */
  formatAddress: (address) => {
    if (!address) return '';

    const parts = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  },

  /**
   * Rút gọn chuỗi nếu quá dài
   *
   * @param {String} text - Chuỗi cần rút gọn
   * @param {Number} maxLength - Độ dài tối đa
   * @returns {String} Chuỗi đã rút gọn
   */
  truncateText: (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength) + '...';
  },

  /**
   * Chuyển đổi chuỗi thành slug URL
   *
   * @param {String} text - Chuỗi cần chuyển đổi
   * @returns {String} Slug URL
   */
  slugify: (text) => {
    if (!text) return '';

    // Chuyển về chữ thường và thay thế dấu tiếng Việt
    const slug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay space bằng dấu gạch ngang
      .replace(/-+/g, '-') // Loại bỏ dấu gạch ngang liên tiếp
      .trim();

    return slug;
  },

  /**
   * Định dạng tên người
   *
   * @param {String} firstName - Tên
   * @param {String} lastName - Họ
   * @returns {String} Tên đầy đủ
   */
  formatName: (firstName, lastName) => {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName;
    if (!lastName) return firstName;

    return `${lastName} ${firstName}`;
  },

  /**
   * Định dạng dữ liệu sản phẩm trước khi trả về client
   *
   * @param {Object} product - Dữ liệu sản phẩm cần định dạng
   * @returns {Object} - Dữ liệu sản phẩm đã được định dạng
   */
  formatProductResponse: (product) => {
    if (!product) return null;

    // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
    const formattedProduct = { ...product };

    // Định dạng giá tiền
    if (formattedProduct.pricing) {
      if (formattedProduct.pricing.regular) {
        formattedProduct.pricing.formattedRegularPrice = formatters.formatCurrency(
          formattedProduct.pricing.regular,
          formattedProduct.pricing.currency || 'VND'
        );
      }

      if (formattedProduct.pricing.sale) {
        formattedProduct.pricing.formattedSalePrice = formatters.formatCurrency(
          formattedProduct.pricing.sale,
          formattedProduct.pricing.currency || 'VND'
        );
      }

      if (formattedProduct.pricing.finalPrice) {
        formattedProduct.pricing.formattedFinalPrice = formatters.formatCurrency(
          formattedProduct.pricing.finalPrice,
          formattedProduct.pricing.currency || 'VND'
        );
      }
    }

    // Định dạng mô tả ngắn gọn
    if (formattedProduct.description) {
      formattedProduct.shortDescription = formatters.truncateText(
        formattedProduct.description,
        150
      );
    }

    // Định dạng ngày tháng
    if (formattedProduct.dates) {
      if (formattedProduct.dates.created) {
        formattedProduct.dates.formattedCreatedDate = new Date(
          formattedProduct.dates.created
        ).toLocaleDateString('vi-VN');
      }
      if (formattedProduct.dates.updated) {
        formattedProduct.dates.formattedUpdatedDate = new Date(
          formattedProduct.dates.updated
        ).toLocaleDateString('vi-VN');
      }
    }

    // Định dạng trạng thái tồn kho
    if (formattedProduct.inventory) {
      formattedProduct.inventory.statusText = formattedProduct.inventory.inStock
        ? 'Còn hàng'
        : 'Hết hàng';
    }

    // Định dạng đánh giá trung bình
    if (formattedProduct.averageRating !== undefined) {
      formattedProduct.formattedRating = formattedProduct.averageRating.toFixed(1);
    }

    return formattedProduct;
  },
};

module.exports = formatters;
