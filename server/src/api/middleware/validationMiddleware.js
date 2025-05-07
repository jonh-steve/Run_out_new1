/**
 * Middleware xác thực dữ liệu sử dụng Joi và các tiện ích khác
 * @author Steve
 * @project RunOut-Biliard
 *
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const Joi = require('joi');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

/**
 * Middleware kiểm tra tính hợp lệ của MongoDB ObjectId
 * @returns {function} Express middleware
 */
const validateMongoId = () => (req, res, next) => {
  const idParam = req.params.id;

  if (!idParam) {
    return res.status(400).json({
      success: false,
      message: 'ID không được cung cấp',
    });
  }

  if (!ObjectId.isValid(idParam)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ',
    });
  }

  next();
};

/**
 * Middleware tạo bộ xác thực dữ liệu từ schema Joi
 * @param {Joi.Schema} schema - Joi schema sử dụng để xác thực
 * @returns {function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false, // Trả về tất cả lỗi thay vì chỉ lỗi đầu tiên
    stripUnknown: true, // Loại bỏ các trường không được định nghĩa trong schema
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errorMessages,
    });
  }

  next();
};

/**
 * Middleware tạo bộ xác thực dữ liệu từ schema Joi cho query params
 * @param {Joi.Schema} schema - Joi schema sử dụng để xác thực
 * @returns {function} Express middleware
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: errorMessages,
    });
  }

  next();
};

// Schema mẫu cho sản phẩm (giữ lại từ file gốc)
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500).required(),
});

/**
 * Middleware xác thực dữ liệu sản phẩm (giữ lại từ file gốc để tương thích ngược)
 * @deprecated Sử dụng hàm validate với schema tương ứng thay thế
 */
const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

/**
 * Các helpers hữu ích cho xác thực dữ liệu
 */
const validationHelpers = {
  /**
   * Tạo một custom validator để xác thực mật khẩu mạnh
   */
  strongPassword: () =>
    Joi.string()
      .min(8)
      .max(30)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      ),

  /**
   * Tạo custom validator cho số điện thoại Việt Nam
   */
  vietnamesePhone: () =>
    Joi.string()
      .pattern(/^(0|\+84)([0-9]{9,10})$/)
      .message('Số điện thoại không hợp lệ, phải là số điện thoại Việt Nam'),
};

module.exports = {
  validateMongoId,
  validate,
  validateQuery,
  validateProduct, // Giữ lại để tương thích ngược
  validationHelpers,
};
