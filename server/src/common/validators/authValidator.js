/**
 * Auth Validator - Định nghĩa các schema validation cho authentication
 * @author Steve
 * @project RunOut-Biliard
 */

const Joi = require('joi');

// Schema đăng ký
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Tên phải có ít nhất {#limit} ký tự',
    'string.max': 'Tên không được vượt quá {#limit} ký tự',
    'string.empty': 'Tên không được để trống',
    'any.required': 'Tên là trường bắt buộc',
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là trường bắt buộc',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một chữ số',
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là trường bắt buộc',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu phải khớp với mật khẩu',
    'string.empty': 'Xác nhận mật khẩu không được để trống',
    'any.required': 'Xác nhận mật khẩu là trường bắt buộc',
  }),

  phone: Joi.string()
    .pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),
});

// Schema đăng nhập
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là trường bắt buộc',
    }),

  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu là trường bắt buộc',
  }),

  rememberMe: Joi.boolean().default(false),
});

// Schema refresh token
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh token không được để trống',
    'any.required': 'Refresh token là trường bắt buộc',
  }),
});

// Schema quên mật khẩu
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là trường bắt buộc',
    }),
});

// Schema đặt lại mật khẩu
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token không được để trống',
    'any.required': 'Token là trường bắt buộc',
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một chữ số',
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là trường bắt buộc',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu phải khớp với mật khẩu',
    'string.empty': 'Xác nhận mật khẩu không được để trống',
    'any.required': 'Xác nhận mật khẩu là trường bắt buộc',
  }),
});

// Schema xác thực email
const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token không được để trống',
    'any.required': 'Token là trường bắt buộc',
  }),
});

module.exports = {
  register: registerSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  verifyEmail: verifyEmailSchema,
};
