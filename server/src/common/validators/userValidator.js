/**
 * User Validator
 * Định nghĩa các validation rules cho user API
 */

const Joi = require('joi');

const userValidator = {
  /**
   * Validate khi đăng ký người dùng mới
   */
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Tên phải là chuỗi',
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
      'any.required': 'Tên là bắt buộc',
    }),

    email: Joi.string().email().required().messages({
      'string.base': 'Email phải là chuỗi',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

    password: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.base': 'Mật khẩu phải là chuỗi',
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
        'string.pattern.base':
          'Mật khẩu phải có ít nhất một chữ thường, một chữ hoa, một số và một ký tự đặc biệt',
        'any.required': 'Mật khẩu là bắt buộc',
      }),

    confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
      'any.only': 'Xác nhận mật khẩu phải khớp với mật khẩu',
      'any.required': 'Xác nhận mật khẩu là bắt buộc',
    }),

    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .allow('')
      .messages({
        'string.base': 'Số điện thoại phải là chuỗi',
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
      }),

    avatar: Joi.string().uri().allow('').messages({
      'string.base': 'Avatar phải là chuỗi',
      'string.uri': 'Avatar phải là một URL hợp lệ',
    }),

    address: Joi.object({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      zipCode: Joi.string().allow(''),
      country: Joi.string().allow(''),
    }).optional(),

    preferences: Joi.object({
      language: Joi.string().valid('vi', 'en').default('vi'),
      notifications: Joi.object({
        email: Joi.boolean().default(true),
        marketing: Joi.boolean().default(true),
      }).default({
        email: true,
        marketing: true,
      }),
    })
      .optional()
      .default({
        language: 'vi',
        notifications: {
          email: true,
          marketing: true,
        },
      }),
  }),

  /**
   * Validate khi đăng nhập
   */
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email phải là chuỗi',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

    password: Joi.string().required().messages({
      'string.base': 'Mật khẩu phải là chuỗi',
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là bắt buộc',
    }),

    rememberMe: Joi.boolean().default(false),
  }),

  /**
   * Validate khi yêu cầu đặt lại mật khẩu
   */
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email phải là chuỗi',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
  }),

  /**
   * Validate khi đặt lại mật khẩu
   */
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'string.base': 'Token phải là chuỗi',
      'string.empty': 'Token không được để trống',
      'any.required': 'Token là bắt buộc',
    }),

    password: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.base': 'Mật khẩu phải là chuỗi',
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
        'string.pattern.base':
          'Mật khẩu phải có ít nhất một chữ thường, một chữ hoa, một số và một ký tự đặc biệt',
        'any.required': 'Mật khẩu là bắt buộc',
      }),

    confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
      'any.only': 'Xác nhận mật khẩu phải khớp với mật khẩu',
      'any.required': 'Xác nhận mật khẩu là bắt buộc',
    }),
  }),

  /**
   * Validate khi cập nhật thông tin người dùng
   */
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).messages({
      'string.base': 'Tên phải là chuỗi',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
    }),

    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .allow('')
      .messages({
        'string.base': 'Số điện thoại phải là chuỗi',
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
      }),

    avatar: Joi.string().uri().allow('').messages({
      'string.base': 'Avatar phải là chuỗi',
      'string.uri': 'Avatar phải là một URL hợp lệ',
    }),

    address: Joi.object({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      zipCode: Joi.string().allow(''),
      country: Joi.string().allow(''),
    }).optional(),

    preferences: Joi.object({
      language: Joi.string().valid('vi', 'en'),
      notifications: Joi.object({
        email: Joi.boolean(),
        marketing: Joi.boolean(),
      }),
    }).optional(),
  }),

  /**
   * Validate khi thay đổi mật khẩu
   */
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.base': 'Mật khẩu hiện tại phải là chuỗi',
      'string.empty': 'Mật khẩu hiện tại không được để trống',
      'any.required': 'Mật khẩu hiện tại là bắt buộc',
    }),

    newPassword: Joi.string()
      .min(8)
      .max(64)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.base': 'Mật khẩu mới phải là chuỗi',
        'string.empty': 'Mật khẩu mới không được để trống',
        'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu mới không được vượt quá {#limit} ký tự',
        'string.pattern.base':
          'Mật khẩu mới phải có ít nhất một chữ thường, một chữ hoa, một số và một ký tự đặc biệt',
        'any.required': 'Mật khẩu mới là bắt buộc',
      }),

    confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required().messages({
      'any.only': 'Xác nhận mật khẩu phải khớp với mật khẩu mới',
      'any.required': 'Xác nhận mật khẩu là bắt buộc',
    }),
  }),

  /**
   * Validate khi xác thực email
   */
  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      'string.base': 'Token phải là chuỗi',
      'string.empty': 'Token không được để trống',
      'any.required': 'Token là bắt buộc',
    }),
  }),

  /**
   * Validate khi admin cập nhật người dùng
   */
  adminUpdateUser: Joi.object({
    name: Joi.string().min(2).max(100).messages({
      'string.base': 'Tên phải là chuỗi',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
    }),

    email: Joi.string().email().messages({
      'string.base': 'Email phải là chuỗi',
      'string.email': 'Email không hợp lệ',
    }),

    role: Joi.string().valid('user', 'admin', 'staff').messages({
      'string.base': 'Vai trò phải là chuỗi',
      'any.only': 'Vai trò không hợp lệ',
    }),

    isActive: Joi.boolean().messages({
      'boolean.base': 'Trạng thái hoạt động phải là boolean',
    }),

    emailVerified: Joi.boolean().messages({
      'boolean.base': 'Trạng thái xác thực email phải là boolean',
    }),
  }),

  /**
   * Validate khi tạo người dùng mới (bởi admin)
   */
  adminCreateUser: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Tên phải là chuỗi',
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
      'any.required': 'Tên là bắt buộc',
    }),

    email: Joi.string().email().required().messages({
      'string.base': 'Email phải là chuỗi',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

    password: Joi.string().min(8).max(64).required().messages({
      'string.base': 'Mật khẩu phải là chuỗi',
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
      'any.required': 'Mật khẩu là bắt buộc',
    }),

    role: Joi.string().valid('user', 'admin', 'staff').default('user').messages({
      'string.base': 'Vai trò phải là chuỗi',
      'any.only': 'Vai trò không hợp lệ',
    }),

    isActive: Joi.boolean().default(true).messages({
      'boolean.base': 'Trạng thái hoạt động phải là boolean',
    }),

    emailVerified: Joi.boolean().default(false).messages({
      'boolean.base': 'Trạng thái xác thực email phải là boolean',
    }),

    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .allow('')
      .messages({
        'string.base': 'Số điện thoại phải là chuỗi',
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
      }),
  }),
};

module.exports =  userValidator ;
