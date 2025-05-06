/**
 * Review Validator
 * Định nghĩa các validation rules cho review API
 */

const Joi = require('joi');

const reviewValidator = {
  /**
   * Validate khi tạo đánh giá mới
   */
  createReview: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Đánh giá sao phải là số',
      'number.min': 'Đánh giá sao không được nhỏ hơn {#limit}',
      'number.max': 'Đánh giá sao không được lớn hơn {#limit}',
      'any.required': 'Đánh giá sao là bắt buộc',
    }),

    title: Joi.string().max(100).messages({
      'string.base': 'Tiêu đề phải là chuỗi',
      'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự',
    }),

    review: Joi.string().max(2000).required().messages({
      'string.base': 'Nội dung đánh giá phải là chuỗi',
      'string.empty': 'Nội dung đánh giá không được để trống',
      'string.max': 'Nội dung đánh giá không được vượt quá {#limit} ký tự',
      'any.required': 'Nội dung đánh giá là bắt buộc',
    }),

    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required().messages({
            'string.base': 'URL hình ảnh phải là chuỗi',
            'string.empty': 'URL hình ảnh không được để trống',
            'string.uri': 'URL hình ảnh không hợp lệ',
            'any.required': 'URL hình ảnh là bắt buộc',
          }),
          thumbnail: Joi.string().uri().messages({
            'string.base': 'URL thumbnail phải là chuỗi',
            'string.uri': 'URL thumbnail không hợp lệ',
          }),
          caption: Joi.string().max(200).messages({
            'string.base': 'Chú thích hình ảnh phải là chuỗi',
            'string.max': 'Chú thích hình ảnh không được vượt quá {#limit} ký tự',
          }),
        })
      )
      .max(5)
      .messages({
        'array.base': 'Hình ảnh phải là mảng',
        'array.max': 'Không được đăng tải quá {#limit} hình ảnh',
      }),

    order: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.base': 'ID đơn hàng phải là chuỗi',
        'string.pattern.base': 'ID đơn hàng không hợp lệ',
      }),
  }),

  /**
   * Validate khi cập nhật đánh giá
   */
  updateReview: Joi.object({
    rating: Joi.number().min(1).max(5).messages({
      'number.base': 'Đánh giá sao phải là số',
      'number.min': 'Đánh giá sao không được nhỏ hơn {#limit}',
      'number.max': 'Đánh giá sao không được lớn hơn {#limit}',
    }),

    title: Joi.string().max(100).messages({
      'string.base': 'Tiêu đề phải là chuỗi',
      'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự',
    }),

    review: Joi.string().max(2000).messages({
      'string.base': 'Nội dung đánh giá phải là chuỗi',
      'string.max': 'Nội dung đánh giá không được vượt quá {#limit} ký tự',
    }),

    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required().messages({
            'string.base': 'URL hình ảnh phải là chuỗi',
            'string.empty': 'URL hình ảnh không được để trống',
            'string.uri': 'URL hình ảnh không hợp lệ',
            'any.required': 'URL hình ảnh là bắt buộc',
          }),
          thumbnail: Joi.string().uri().messages({
            'string.base': 'URL thumbnail phải là chuỗi',
            'string.uri': 'URL thumbnail không hợp lệ',
          }),
          caption: Joi.string().max(200).messages({
            'string.base': 'Chú thích hình ảnh phải là chuỗi',
            'string.max': 'Chú thích hình ảnh không được vượt quá {#limit} ký tự',
          }),
        })
      )
      .max(5)
      .messages({
        'array.base': 'Hình ảnh phải là mảng',
        'array.max': 'Không được đăng tải quá {#limit} hình ảnh',
      }),
  }),

  /**
   * Validate khi upvote/downvote đánh giá
   */
  voteReview: Joi.object({
    vote: Joi.number().valid(1, -1).required().messages({
      'number.base': 'Vote phải là số',
      'any.only': 'Vote chỉ có thể là 1 (upvote) hoặc -1 (downvote)',
      'any.required': 'Vote là bắt buộc',
    }),
  }),

  /**
   * Validate khi báo cáo đánh giá
   */
  reportReview: Joi.object({
    reason: Joi.string()
      .valid('spam', 'offensive', 'inappropriate', 'misleading', 'other')
      .required()
      .messages({
        'string.base': 'Lý do phải là chuỗi',
        'string.empty': 'Lý do không được để trống',
        'any.only': 'Lý do không hợp lệ',
        'any.required': 'Lý do là bắt buộc',
      }),

    description: Joi.string()
      .max(500)
      .when('reason', {
        is: 'other',
        then: Joi.required(),
      })
      .messages({
        'string.base': 'Mô tả phải là chuỗi',
        'string.empty': 'Mô tả không được để trống',
        'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
        'any.required': 'Mô tả là bắt buộc khi lý do là "other"',
      }),
  }),

  /**
   * Validate khi kiểm duyệt đánh giá
   */
  moderateReview: Joi.object({
    action: Joi.string().valid('approve', 'reject').required().messages({
      'string.base': 'Hành động phải là chuỗi',
      'string.empty': 'Hành động không được để trống',
      'any.only': 'Hành động phải là "approve" hoặc "reject"',
      'any.required': 'Hành động là bắt buộc',
    }),

    reason: Joi.string()
      .max(500)
      .when('action', {
        is: 'reject',
        then: Joi.required(),
      })
      .messages({
        'string.base': 'Lý do phải là chuỗi',
        'string.empty': 'Lý do không được để trống',
        'string.max': 'Lý do không được vượt quá {#limit} ký tự',
        'any.required': 'Lý do là bắt buộc khi từ chối đánh giá',
      }),
  }),

  /**
   * Validate khi thêm phản hồi cho đánh giá
   */
  addReviewResponse: Joi.object({
    content: Joi.string().min(2).max(1000).required().messages({
      'string.base': 'Nội dung phản hồi phải là chuỗi',
      'string.empty': 'Nội dung phản hồi không được để trống',
      'string.min': 'Nội dung phản hồi phải có ít nhất {#limit} ký tự',
      'string.max': 'Nội dung phản hồi không được vượt quá {#limit} ký tự',
      'any.required': 'Nội dung phản hồi là bắt buộc',
    }),
  }),
};

module.exports = { reviewValidator };
