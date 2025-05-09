/**
 * Tiện ích xử lý response chuẩn hóa
 */
const responseHandler = {
  /**
   * Trả về response thành công
   *
   * @param {Object} res - Express response object
   * @param {Object} data - Dữ liệu trả về
   * @param {String} message - Thông báo thành công
   * @param {Number} statusCode - HTTP status code
   */
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  },

  /**
   * Trả về response lỗi
   *
   * @param {Object} res - Express response object
   * @param {String} message - Thông báo lỗi
   * @param {Number} statusCode - HTTP status code
   * @param {Object} errors - Chi tiết lỗi
   */
  error: (res, message = 'Error occurred', statusCode = 400, errors = null) => {
    const response = {
      status: 'error',
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },

  /**
   * Trả về response khi tạo thành công
   *
   * @param {Object} res - Express response object
   * @param {Object} data - Dữ liệu trả về
   * @param {String} message - Thông báo thành công
   */
  created: (res, data = null, message = 'Resource created successfully') => {
    return responseHandler.success(res, data, message, 201);
  },

  /**
   * Trả về response không có nội dung
   *
   * @param {Object} res - Express response object
   */
  noContent: (res) => {
    return res.status(204).end();
  },

  /**
   * Trả về response với dữ liệu được phân trang
   *
   * @param {Object} res - Express response object
   * @param {Array} data - Dữ liệu trả về
   * @param {Number} page - Trang hiện tại
   * @param {Number} limit - Số lượng items mỗi trang
   * @param {Number} total - Tổng số items
   */
  paginated: (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: 'success',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  },
};

module.exports = responseHandler;
