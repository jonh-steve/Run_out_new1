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
/**
/**
 * Xác thực dữ liệu sản phẩm với nhiều tùy chọn nâng cao
 * @param {Object} data - Dữ liệu sản phẩm cần xác thực
 * @param {Object|Boolean} options - Các tùy chọn xác thực hoặc boolean cho isUpdate
 * @property {Boolean} options.isUpdate - Có phải đang cập nhật không (true) hay đang tạo mới (false)
 * @property {Array<string>} options.fields - Danh sách các trường cần xác thực (nếu chỉ muốn xác thực một số trường)
 * @property {Boolean} options.formatErrors - Có định dạng lỗi thành dạng dễ đọc không
 * @property {Boolean} options.checkBusinessRules - Có kiểm tra các quy tắc nghiệp vụ không
 * @returns {Object} - Kết quả xác thực { error, value, isValid, errorDetails }
 */
const validateProductData = (data, options = {}) => {
  // Xử lý trường hợp options là boolean (tương thích ngược)
  let isUpdate = false;
  let fields = null;
  let formatErrors = false;
  let checkBusinessRules = false;

  // Kiểm tra kiểu dữ liệu của options
  if (typeof options === 'boolean') {
    isUpdate = options;
  } else if (options && typeof options === 'object') {
    // Chỉ lấy các thuộc tính nếu options là object
    isUpdate = options.isUpdate === true;
    fields = Array.isArray(options.fields) ? options.fields : null;
    formatErrors = options.formatErrors === true;
    checkBusinessRules = options.checkBusinessRules === true;
  }

  // Chọn schema phù hợp
  let schema = isUpdate ? updateProductValidator : createProductValidator;

  // Nếu chỉ xác thực một số trường cụ thể
  if (fields && Array.isArray(fields) && fields.length > 0) {
    const schemaToUse = isUpdate ? updateProductValidator : createProductValidator;
    const filteredSchema = Joi.object(
      fields.reduce((acc, field) => {
        if (
          schemaToUse.$_terms &&
          schemaToUse.$_terms.keys &&
          schemaToUse.$_terms.keys.some((k) => k.key === field)
        ) {
          acc[field] = schemaToUse.$_terms.keys.find((k) => k.key === field).schema;
        }
        return acc;
      }, {})
    );
    schema = filteredSchema;
  }

  // Thực hiện xác thực cơ bản
  const validationResult = schema.validate(data, { abortEarly: false });

  // Nếu không cần xử lý thêm, trả về kết quả ngay
  if (!formatErrors && !checkBusinessRules) {
    return {
      ...validationResult,
      isValid: !validationResult.error,
    };
  }

  // Xử lý kết quả
  let result = {
    value: validationResult.value,
    isValid: !validationResult.error,
    errorDetails: null,
  };

  // Định dạng lỗi thành dạng dễ đọc nếu cần
  if (validationResult.error && formatErrors) {
    const errorDetails = {};

    validationResult.error.details.forEach((err) => {
      const field = err.path.join('.');
      if (!errorDetails[field]) {
        errorDetails[field] = [];
      }
      errorDetails[field].push(err.message);
    });

    result.error = validationResult.error;
    result.errorDetails = errorDetails;
  } else {
    result.error = validationResult.error;
  }

  // Kiểm tra các quy tắc nghiệp vụ nếu cần
  if (checkBusinessRules && !result.error) {
    const businessErrors = validateBusinessRules(data, isUpdate);

    if (businessErrors.length > 0) {
      result.isValid = false;
      result.businessErrors = businessErrors;

      if (formatErrors) {
        const errorDetails = result.errorDetails || {};

        businessErrors.forEach((err) => {
          const field = err.field;
          if (!errorDetails[field]) {
            errorDetails[field] = [];
          }
          errorDetails[field].push(err.message);
        });

        result.errorDetails = errorDetails;
      }
    }
  }

  return result;
};
/**
 * Kiểm tra các quy tắc nghiệp vụ phức tạp không thể xác thực bằng Joi
 * @param {Object} data - Dữ liệu sản phẩm
 * @param {Boolean} isUpdate - Có phải đang cập nhật không
 * @returns {Array} - Danh sách lỗi nghiệp vụ
 */
function validateBusinessRules(data, isUpdate) {
  const errors = [];

  // Kiểm tra giá khuyến mãi phải nhỏ hơn giá gốc
  if (data.price && data.salePrice && data.salePrice >= data.price) {
    errors.push({
      field: 'salePrice',
      message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    });
  }

  // Kiểm tra nếu có discount thì phải có các trường bắt buộc
  if (data.discount && data.discount.percentage) {
    if (!data.discount.startDate) {
      errors.push({
        field: 'discount.startDate',
        message: 'Ngày bắt đầu khuyến mãi là bắt buộc khi có phần trăm giảm giá',
      });
    }

    if (!data.discount.endDate) {
      errors.push({
        field: 'discount.endDate',
        message: 'Ngày kết thúc khuyến mãi là bắt buộc khi có phần trăm giảm giá',
      });
    }
  }

  // Kiểm tra ít nhất một hình ảnh phải là hình chính
  if (data.images && data.images.length > 0) {
    const hasPrimaryImage = data.images.some((img) => img.isPrimary);
    if (!hasPrimaryImage) {
      errors.push({
        field: 'images',
        message: 'Phải có ít nhất một hình ảnh được đánh dấu là hình chính (isPrimary)',
      });
    }
  }

  return errors;
}
module.exports = {
  createProductValidator,
  updateProductValidator,
  validateProductData,
};
