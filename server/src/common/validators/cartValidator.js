// server/src/common/validators/cartValidator.js

const Joi = require('joi');

const createCartValidator = Joi.object({
  user: Joi.string().allow(null).messages({
    'string.base': 'User ID phải là một chuỗi',
  }),

  sessionId: Joi.string().allow(null).messages({
    'string.base': 'Session ID phải là một chuỗi',
  }),

  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required().messages({
          'string.base': 'Product ID phải là một chuỗi',
          'string.empty': 'Product ID không được để trống',
          'any.required': 'Product ID là bắt buộc',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.base': 'Số lượng phải là một số',
          'number.integer': 'Số lượng phải là số nguyên',
          'number.min': 'Số lượng phải lớn hơn 0',
          'any.required': 'Số lượng là bắt buộc',
        }),
        attributes: Joi.object().allow(null).default({}),
      })
    )
    .default([]),
})
  .or('user', 'sessionId')
  .messages({
    'object.missing': 'Phải có ít nhất một trong hai trường user hoặc sessionId',
  });

const addItemValidator = Joi.object({
  product: Joi.string().required().messages({
    'string.base': 'Product ID phải là một chuỗi',
    'string.empty': 'Product ID không được để trống',
    'any.required': 'Product ID là bắt buộc',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Số lượng phải là một số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải lớn hơn 0',
    'any.required': 'Số lượng là bắt buộc',
  }),
  attributes: Joi.object().allow(null).default({}),
});

const updateItemValidator = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Số lượng phải là một số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải lớn hơn 0',
    'any.required': 'Số lượng là bắt buộc',
  }),
});

const applyCouponValidator = Joi.object({
  code: Joi.string().required().messages({
    'string.base': 'Mã giảm giá phải là một chuỗi',
    'string.empty': 'Mã giảm giá không được để trống',
    'any.required': 'Mã giảm giá là bắt buộc',
  }),
});

const shippingAddressValidator = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Tên người nhận phải là một chuỗi',
    'string.empty': 'Tên người nhận không được để trống',
    'any.required': 'Tên người nhận là bắt buộc',
  }),
  phone: Joi.string()
    .required()
    .pattern(/^(0|\+84)([0-9]{9,10})$/)
    .messages({
      'string.base': 'Số điện thoại phải là một chuỗi',
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)',
      'any.required': 'Số điện thoại là bắt buộc',
    }),
  street: Joi.string().required().messages({
    'string.base': 'Địa chỉ đường phố phải là một chuỗi',
    'string.empty': 'Địa chỉ đường phố không được để trống',
    'any.required': 'Địa chỉ đường phố là bắt buộc',
  }),
  city: Joi.string().required().messages({
    'string.base': 'Thành phố phải là một chuỗi',
    'string.empty': 'Thành phố không được để trống',
    'any.required': 'Thành phố là bắt buộc',
  }),
  state: Joi.string().allow('', null).messages({
    'string.base': 'Tỉnh/Bang phải là một chuỗi',
  }),
  zipCode: Joi.string().required().messages({
    'string.base': 'Mã bưu điện phải là một chuỗi',
    'string.empty': 'Mã bưu điện không được để trống',
    'any.required': 'Mã bưu điện là bắt buộc',
  }),
  country: Joi.string().required().messages({
    'string.base': 'Quốc gia phải là một chuỗi',
    'string.empty': 'Quốc gia không được để trống',
    'any.required': 'Quốc gia là bắt buộc',
  }),
  notes: Joi.string().allow('', null).messages({
    'string.base': 'Ghi chú phải là một chuỗi',
  }),
});

const shippingMethodValidator = Joi.object({
  type: Joi.string().valid('standard', 'express').required().messages({
    'string.base': 'Phương thức vận chuyển phải là một chuỗi',
    'string.empty': 'Phương thức vận chuyển không được để trống',
    'any.only': 'Phương thức vận chuyển phải là một trong các giá trị: standard, express',
    'any.required': 'Phương thức vận chuyển là bắt buộc',
  }),
});

const checkoutValidator = Joi.object({
  cartId: Joi.string().required().messages({
    'string.base': 'Cart ID phải là một chuỗi',
    'string.empty': 'Cart ID không được để trống',
    'any.required': 'Cart ID là bắt buộc',
  }),
  shippingAddress: shippingAddressValidator.required().messages({
    'any.required': 'Địa chỉ giao hàng là bắt buộc',
  }),
  shippingMethod: shippingMethodValidator.required().messages({
    'any.required': 'Phương thức vận chuyển là bắt buộc',
  }),
  paymentMethod: Joi.string()
    .valid('cod', 'bank_transfer', 'vnpay', 'credit_card')
    .required()
    .messages({
      'string.base': 'Phương thức thanh toán phải là một chuỗi',
      'string.empty': 'Phương thức thanh toán không được để trống',
      'any.only':
        'Phương thức thanh toán phải là một trong các giá trị: cod, bank_transfer, vnpay, credit_card',
      'any.required': 'Phương thức thanh toán là bắt buộc',
    }),
  customerNotes: Joi.string().allow('', null).max(500).messages({
    'string.base': 'Ghi chú phải là một chuỗi',
    'string.max': 'Ghi chú không được vượt quá {#limit} ký tự',
  }),
});

const mergeCartsValidator = Joi.object({
  sourceCartId: Joi.string().required().messages({
    'string.base': 'Source Cart ID phải là một chuỗi',
    'string.empty': 'Source Cart ID không được để trống',
    'any.required': 'Source Cart ID là bắt buộc',
  }),
  destinationCartId: Joi.string().required().messages({
    'string.base': 'Destination Cart ID phải là một chuỗi',
    'string.empty': 'Destination Cart ID không được để trống',
    'any.required': 'Destination Cart ID là bắt buộc',
  }),
});

module.exports = {
  createCartValidator,
  addItemValidator,
  updateItemValidator,
  applyCouponValidator,
  shippingAddressValidator,
  shippingMethodValidator,
  checkoutValidator,
  mergeCartsValidator,
};
