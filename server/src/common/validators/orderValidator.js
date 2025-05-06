/**
 * Order Validator
 * Định nghĩa các validation rules cho order API
 */

const Joi = require('joi');

const orderValidator = {
  /**
   * Validate khi tạo đơn hàng mới
   */
  createOrder: Joi.object({
    // Thông tin liên hệ
    customerInfo: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.base': 'Tên khách hàng phải là chuỗi',
        'string.empty': 'Tên khách hàng không được để trống',
        'string.min': 'Tên khách hàng phải có ít nhất {#limit} ký tự',
        'string.max': 'Tên khách hàng không được vượt quá {#limit} ký tự',
        'any.required': 'Tên khách hàng là bắt buộc',
      }),
      email: Joi.string().email().required().messages({
        'string.base': 'Email phải là chuỗi',
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc',
      }),
      phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .required()
        .messages({
          'string.base': 'Số điện thoại phải là chuỗi',
          'string.empty': 'Số điện thoại không được để trống',
          'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
          'any.required': 'Số điện thoại là bắt buộc',
        }),
    })
      .required()
      .messages({
        'object.base': 'Thông tin khách hàng phải là đối tượng',
        'any.required': 'Thông tin khách hàng là bắt buộc',
      }),

    // Thông tin vận chuyển
    shippingAddress: Joi.object({
      name: Joi.string().min(2).max(100).messages({
        'string.base': 'Tên người nhận phải là chuỗi',
        'string.min': 'Tên người nhận phải có ít nhất {#limit} ký tự',
        'string.max': 'Tên người nhận không được vượt quá {#limit} ký tự',
      }),
      phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .messages({
          'string.base': 'Số điện thoại phải là chuỗi',
          'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
        }),
      street: Joi.string().required().messages({
        'string.base': 'Địa chỉ đường phố phải là chuỗi',
        'string.empty': 'Địa chỉ đường phố không được để trống',
        'any.required': 'Địa chỉ đường phố là bắt buộc',
      }),
      city: Joi.string().required().messages({
        'string.base': 'Thành phố phải là chuỗi',
        'string.empty': 'Thành phố không được để trống',
        'any.required': 'Thành phố là bắt buộc',
      }),
      state: Joi.string().allow('').messages({
        'string.base': 'Tỉnh/Bang phải là chuỗi',
      }),
      zipCode: Joi.string().required().messages({
        'string.base': 'Mã bưu điện phải là chuỗi',
        'string.empty': 'Mã bưu điện không được để trống',
        'any.required': 'Mã bưu điện là bắt buộc',
      }),
      country: Joi.string().required().messages({
        'string.base': 'Quốc gia phải là chuỗi',
        'string.empty': 'Quốc gia không được để trống',
        'any.required': 'Quốc gia là bắt buộc',
      }),
      notes: Joi.string().max(500).messages({
        'string.base': 'Ghi chú phải là chuỗi',
        'string.max': 'Ghi chú không được vượt quá {#limit} ký tự',
      }),
    })
      .required()
      .messages({
        'object.base': 'Địa chỉ giao hàng phải là đối tượng',
        'any.required': 'Địa chỉ giao hàng là bắt buộc',
      }),

    // Phương thức vận chuyển và thanh toán
    shippingMethod: Joi.string().valid('standard', 'express').required().messages({
      'string.base': 'Phương thức vận chuyển phải là chuỗi',
      'string.empty': 'Phương thức vận chuyển không được để trống',
      'any.only': 'Phương thức vận chuyển không hợp lệ',
      'any.required': 'Phương thức vận chuyển là bắt buộc',
    }),

    paymentMethod: Joi.string().valid('cod', 'credit_card', 'paypal', 'vnpay').required().messages({
      'string.base': 'Phương thức thanh toán phải là chuỗi',
      'string.empty': 'Phương thức thanh toán không được để trống',
      'any.only': 'Phương thức thanh toán không hợp lệ',
      'any.required': 'Phương thức thanh toán là bắt buộc',
    }),

    // Ghi chú đơn hàng
    customerNotes: Joi.string().max(500).messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.max': 'Ghi chú không được vượt quá {#limit} ký tự',
    }),

    // Mã giảm giá
    couponCode: Joi.string().max(50).messages({
      'string.base': 'Mã giảm giá phải là chuỗi',
      'string.max': 'Mã giảm giá không được vượt quá {#limit} ký tự',
    }),

    // ID giỏ hàng (nếu tạo đơn hàng từ giỏ hàng)
    cartId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.base': 'ID giỏ hàng phải là chuỗi',
        'string.pattern.base': 'ID giỏ hàng không hợp lệ',
      }),

    // Các mặt hàng trong đơn hàng (bắt buộc nếu không có cartId)
    items: Joi.when('cartId', {
      is: Joi.exist(),
      then: Joi.array(),
      otherwise: Joi.array()
        .items(
          Joi.object({
            product: Joi.string()
              .regex(/^[0-9a-fA-F]{24}$/)
              .required()
              .messages({
                'string.base': 'ID sản phẩm phải là chuỗi',
                'string.pattern.base': 'ID sản phẩm không hợp lệ',
                'any.required': 'ID sản phẩm là bắt buộc',
              }),
            quantity: Joi.number().integer().min(1).required().messages({
              'number.base': 'Số lượng phải là số',
              'number.integer': 'Số lượng phải là số nguyên',
              'number.min': 'Số lượng phải ít nhất là {#limit}',
              'any.required': 'Số lượng là bắt buộc',
            }),
            attributes: Joi.object().default({}),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.base': 'Các mặt hàng phải là mảng',
          'array.min': 'Phải có ít nhất một mặt hàng',
          'any.required': 'Các mặt hàng là bắt buộc',
        }),
    }),
  }),

  /**
   * Validate khi cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')
      .required()
      .messages({
        'string.base': 'Trạng thái phải là chuỗi',
        'string.empty': 'Trạng thái không được để trống',
        'any.only': 'Trạng thái không hợp lệ',
        'any.required': 'Trạng thái là bắt buộc',
      }),

    note: Joi.string().max(500).messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.max': 'Ghi chú không được vượt quá {#limit} ký tự',
    }),
  }),

  /**
   * Validate khi hủy đơn hàng
   */
  cancelOrder: Joi.object({
    reason: Joi.string().max(500).required().messages({
      'string.base': 'Lý do hủy phải là chuỗi',
      'string.empty': 'Lý do hủy không được để trống',
      'string.max': 'Lý do hủy không được vượt quá {#limit} ký tự',
      'any.required': 'Lý do hủy là bắt buộc',
    }),
  }),
};
module.exports = orderValidator;
//     'any.required': 'Vai trò là bắt buộc'
