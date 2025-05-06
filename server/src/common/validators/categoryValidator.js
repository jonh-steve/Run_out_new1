/**
 * Category Validator
 * Định nghĩa các validation rules cho category API
 */

const Joi = require('joi');

const categoryValidator = {
  /**
   * Validate khi tạo danh mục mới
   */
  createCategory: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Tên danh mục phải là chuỗi',
      'string.empty': 'Tên danh mục không được để trống',
      'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự',
      'any.required': 'Tên danh mục là bắt buộc',
    }),

    slug: Joi.string().min(2).max(100).messages({
      'string.base': 'Slug phải là chuỗi',
      'string.empty': 'Slug không được để trống',
      'string.min': 'Slug phải có ít nhất {#limit} ký tự',
      'string.max': 'Slug không được vượt quá {#limit} ký tự',
    }),

    description: Joi.string().max(500).messages({
      'string.base': 'Mô tả phải là chuỗi',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
    }),

    parent: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null)
      .messages({
        'string.base': 'ID danh mục cha phải là chuỗi',
        'string.pattern.base': 'ID danh mục cha không hợp lệ',
      }),

    image: Joi.object({
      url: Joi.string().uri().required().messages({
        'string.base': 'URL hình ảnh phải là chuỗi',
        'string.empty': 'URL hình ảnh không được để trống',
        'string.uri': 'URL hình ảnh không hợp lệ',
        'any.required': 'URL hình ảnh là bắt buộc',
      }),
      alt: Joi.string().max(100).messages({
        'string.base': 'Alt text phải là chuỗi',
        'string.max': 'Alt text không được vượt quá {#limit} ký tự',
      }),
    }),

    icon: Joi.string().max(100).messages({
      'string.base': 'Icon phải là chuỗi',
      'string.max': 'Icon không được vượt quá {#limit} ký tự',
    }),

    color: Joi.string().max(20).messages({
      'string.base': 'Mã màu phải là chuỗi',
      'string.max': 'Mã màu không được vượt quá {#limit} ký tự',
    }),

    order: Joi.number().integer().min(0).messages({
      'number.base': 'Thứ tự phải là số',
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự không được nhỏ hơn {#limit}',
    }),

    isActive: Joi.boolean().messages({
      'boolean.base': 'isActive phải là boolean',
    }),

    isVisible: Joi.boolean().messages({
      'boolean.base': 'isVisible phải là boolean',
    }),

    isFeatured: Joi.boolean().messages({
      'boolean.base': 'isFeatured phải là boolean',
    }),

    seo: Joi.object({
      metaTitle: Joi.string().max(100),
      metaDescription: Joi.string().max(200),
      keywords: Joi.array().items(Joi.string().max(50)),
    }),

    filters: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('select', 'range', 'checkbox').required(),
        options: Joi.when('type', {
          is: Joi.valid('select', 'checkbox'),
          then: Joi.array().items(Joi.string()).required(),
          otherwise: Joi.forbidden(),
        }),
        min: Joi.when('type', {
          is: 'range',
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
        max: Joi.when('type', {
          is: 'range',
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
        unit: Joi.when('type', {
          is: 'range',
          then: Joi.string(),
          otherwise: Joi.forbidden(),
        }),
      })
    ),
  }),

  /**
   * Validate khi cập nhật danh mục
   */
  updateCategory: Joi.object({
    name: Joi.string().min(2).max(100).messages({
      'string.base': 'Tên danh mục phải là chuỗi',
      'string.empty': 'Tên danh mục không được để trống',
      'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự',
    }),

    slug: Joi.string().min(2).max(100).messages({
      'string.base': 'Slug phải là chuỗi',
      'string.empty': 'Slug không được để trống',
      'string.min': 'Slug phải có ít nhất {#limit} ký tự',
      'string.max': 'Slug không được vượt quá {#limit} ký tự',
    }),

    description: Joi.string().max(500).messages({
      'string.base': 'Mô tả phải là chuỗi',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
    }),

    parent: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null)
      .messages({
        'string.base': 'ID danh mục cha phải là chuỗi',
        'string.pattern.base': 'ID danh mục cha không hợp lệ',
      }),

    image: Joi.object({
      url: Joi.string().uri().messages({
        'string.base': 'URL hình ảnh phải là chuỗi',
        'string.empty': 'URL hình ảnh không được để trống',
        'string.uri': 'URL hình ảnh không hợp lệ',
      }),
      alt: Joi.string().max(100).messages({
        'string.base': 'Alt text phải là chuỗi',
        'string.max': 'Alt text không được vượt quá {#limit} ký tự',
      }),
    }),

    icon: Joi.string().max(100).messages({
      'string.base': 'Icon phải là chuỗi',
      'string.max': 'Icon không được vượt quá {#limit} ký tự',
    }),

    color: Joi.string().max(20).messages({
      'string.base': 'Mã màu phải là chuỗi',
      'string.max': 'Mã màu không được vượt quá {#limit} ký tự',
    }),

    order: Joi.number().integer().min(0).messages({
      'number.base': 'Thứ tự phải là số',
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự không được nhỏ hơn {#limit}',
    }),

    isActive: Joi.boolean().messages({
      'boolean.base': 'isActive phải là boolean',
    }),

    isVisible: Joi.boolean().messages({
      'boolean.base': 'isVisible phải là boolean',
    }),

    isFeatured: Joi.boolean().messages({
      'boolean.base': 'isFeatured phải là boolean',
    }),

    seo: Joi.object({
      metaTitle: Joi.string().max(100),
      metaDescription: Joi.string().max(200),
      keywords: Joi.array().items(Joi.string().max(50)),
    }),

    filters: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('select', 'range', 'checkbox').required(),
        options: Joi.when('type', {
          is: Joi.valid('select', 'checkbox'),
          then: Joi.array().items(Joi.string()).required(),
          otherwise: Joi.forbidden(),
        }),
        min: Joi.when('type', {
          is: 'range',
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
        max: Joi.when('type', {
          is: 'range',
          then: Joi.number().required(),
          otherwise: Joi.forbidden(),
        }),
        unit: Joi.when('type', {
          is: 'range',
          then: Joi.string(),
          otherwise: Joi.forbidden(),
        }),
      })
    ),
  }),
};

module.exports = { categoryValidator };
