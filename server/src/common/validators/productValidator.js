// server/src/common/validators/productValidator.js

const Joi = require('joi');

// const priceRegex = /^\d+(\.\d{1,2})?$/; // Định dạng giá (số nguyên hoặc tối đa 2 chữ số thập phân)
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // Định dạng slug

const createProductValidator = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Tên sản phẩm phải là một chuỗi',
    'string.empty': 'Tên sản phẩm không được để trống',
    'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự',
    'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự',
    'any.required': 'Tên sản phẩm là bắt buộc',
  }),

  slug: Joi.string().pattern(slugRegex).min(3).max(100).required().messages({
    'string.base': 'Slug phải là một chuỗi',
    'string.empty': 'Slug không được để trống',
    'string.min': 'Slug phải có ít nhất {#limit} ký tự',
    'string.max': 'Slug không được vượt quá {#limit} ký tự',
    'string.pattern.base': 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang',
    'any.required': 'Slug là bắt buộc',
  }),

  description: Joi.object({
    short: Joi.string().max(200).required().messages({
      'string.base': 'Mô tả ngắn phải là một chuỗi',
      'string.empty': 'Mô tả ngắn không được để trống',
      'string.max': 'Mô tả ngắn không được vượt quá {#limit} ký tự',
      'any.required': 'Mô tả ngắn là bắt buộc',
    }),
    long: Joi.string().max(2000).required().messages({
      'string.base': 'Mô tả chi tiết phải là một chuỗi',
      'string.empty': 'Mô tả chi tiết không được để trống',
      'string.max': 'Mô tả chi tiết không được vượt quá {#limit} ký tự',
      'any.required': 'Mô tả chi tiết là bắt buộc',
    }),
  }).required(),

  category: Joi.string().required().messages({
    'string.base': 'Danh mục phải là một chuỗi',
    'string.empty': 'Danh mục không được để trống',
    'any.required': 'Danh mục là bắt buộc',
  }),

  subCategory: Joi.string().allow(null, '').messages({
    'string.base': 'Danh mục phụ phải là một chuỗi',
  }),

  brand: Joi.string().required().messages({
    'string.base': 'Thương hiệu phải là một chuỗi',
    'string.empty': 'Thương hiệu không được để trống',
    'any.required': 'Thương hiệu là bắt buộc',
  }),

  manufacturer: Joi.string().allow('', null).messages({
    'string.base': 'Nhà sản xuất phải là một chuỗi',
  }),

  countryOfOrigin: Joi.string().allow('', null).messages({
    'string.base': 'Quốc gia xuất xứ phải là một chuỗi',
  }),

  price: Joi.number().min(0).required().messages({
    'number.base': 'Giá phải là một số',
    'number.min': 'Giá không được âm',
    'any.required': 'Giá là bắt buộc',
  }),

  salePrice: Joi.number().min(0).allow(null).messages({
    'number.base': 'Giá khuyến mãi phải là một số',
    'number.min': 'Giá khuyến mãi không được âm',
  }),

  stock: Joi.number().integer().min(0).required().messages({
    'number.base': 'Số lượng tồn kho phải là một số',
    'number.integer': 'Số lượng tồn kho phải là số nguyên',
    'number.min': 'Số lượng tồn kho không được âm',
    'any.required': 'Số lượng tồn kho là bắt buộc',
  }),

  sku: Joi.string().allow('', null).messages({
    'string.base': 'SKU phải là một chuỗi',
  }),

  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        alt: Joi.string().allow('', null),
        isPrimary: Joi.boolean().default(false),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Hình ảnh phải là một mảng',
      'array.min': 'Phải có ít nhất {#limit} hình ảnh',
      'any.required': 'Hình ảnh là bắt buộc',
    }),

  features: Joi.array().items(Joi.string()).messages({
    'array.base': 'Tính năng phải là một mảng',
  }),

  specifications: Joi.object().unknown(true),

  discount: Joi.object({
    percentage: Joi.number().min(0).max(100),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    type: Joi.string(),
  }).allow(null),

  seo: Joi.object({
    metaTitle: Joi.string().max(60),
    metaDescription: Joi.string().max(160),
    keywords: Joi.array().items(Joi.string()),
  }).allow(null),

  isActive: Joi.boolean().default(true),
  isPromoted: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),
});

const updateProductValidator = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    'string.base': 'Tên sản phẩm phải là một chuỗi',
    'string.empty': 'Tên sản phẩm không được để trống',
    'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự',
    'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự',
  }),

  slug: Joi.string().pattern(slugRegex).min(3).max(100).messages({
    'string.base': 'Slug phải là một chuỗi',
    'string.empty': 'Slug không được để trống',
    'string.min': 'Slug phải có ít nhất {#limit} ký tự',
    'string.max': 'Slug không được vượt quá {#limit} ký tự',
    'string.pattern.base': 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang',
  }),

  description: Joi.object({
    short: Joi.string().max(200).messages({
      'string.base': 'Mô tả ngắn phải là một chuỗi',
      'string.empty': 'Mô tả ngắn không được để trống',
      'string.max': 'Mô tả ngắn không được vượt quá {#limit} ký tự',
    }),
    long: Joi.string().max(2000).messages({
      'string.base': 'Mô tả chi tiết phải là một chuỗi',
      'string.empty': 'Mô tả chi tiết không được để trống',
      'string.max': 'Mô tả chi tiết không được vượt quá {#limit} ký tự',
    }),
  }),

  category: Joi.string().messages({
    'string.base': 'Danh mục phải là một chuỗi',
    'string.empty': 'Danh mục không được để trống',
  }),

  subCategory: Joi.string().allow(null, '').messages({
    'string.base': 'Danh mục phụ phải là một chuỗi',
  }),

  brand: Joi.string().messages({
    'string.base': 'Thương hiệu phải là một chuỗi',
    'string.empty': 'Thương hiệu không được để trống',
  }),

  manufacturer: Joi.string().allow('', null).messages({
    'string.base': 'Nhà sản xuất phải là một chuỗi',
  }),

  countryOfOrigin: Joi.string().allow('', null).messages({
    'string.base': 'Quốc gia xuất xứ phải là một chuỗi',
  }),

  price: Joi.number().min(0).messages({
    'number.base': 'Giá phải là một số',
    'number.min': 'Giá không được âm',
  }),

  salePrice: Joi.number().min(0).allow(null).messages({
    'number.base': 'Giá khuyến mãi phải là một số',
    'number.min': 'Giá khuyến mãi không được âm',
  }),

  stock: Joi.number().integer().min(0).messages({
    'number.base': 'Số lượng tồn kho phải là một số',
    'number.integer': 'Số lượng tồn kho phải là số nguyên',
    'number.min': 'Số lượng tồn kho không được âm',
  }),

  sku: Joi.string().allow('', null).messages({
    'string.base': 'SKU phải là một chuỗi',
  }),

  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        alt: Joi.string().allow('', null),
        isPrimary: Joi.boolean(),
      })
    )
    .min(1)
    .messages({
      'array.base': 'Hình ảnh phải là một mảng',
      'array.min': 'Phải có ít nhất {#limit} hình ảnh',
    }),

  features: Joi.array().items(Joi.string()).messages({
    'array.base': 'Tính năng phải là một mảng',
  }),

  specifications: Joi.object().unknown(true),

  discount: Joi.object({
    percentage: Joi.number().min(0).max(100),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    type: Joi.string(),
  }).allow(null),

  seo: Joi.object({
    metaTitle: Joi.string().max(60),
    metaDescription: Joi.string().max(160),
    keywords: Joi.array().items(Joi.string()),
  }).allow(null),

  isActive: Joi.boolean(),
  isPromoted: Joi.boolean(),
  isFeatured: Joi.boolean(),
});

module.exports = {
  createProductValidator,
  updateProductValidator,
};
