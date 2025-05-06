// server/src/data/models/review.model.js
// File này không có vấn đề chỉ mục trùng lặp, giữ nguyên nội dung
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    // Thông tin cơ bản
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },

    // Nội dung đánh giá
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Hình ảnh đính kèm
    images: [
      {
        url: String,
        thumbnail: String,
        caption: String,
      },
    ],

    // Metadata
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    purchaseDate: Date,

    // Tương tác với đánh giá
    helpfulness: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
          vote: {
            type: Number,
            enum: [1, -1],
          },
          votedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Phản hồi
    responses: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: Date,
      },
    ],

    // Trạng thái
    isVisible: {
      type: Boolean,
      default: true,
    },

    // Thông tin kiểm duyệt
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      moderatedAt: Date,
      reason: String,
    },
  },
  {
    timestamps: true,
  }
);

// Chỉ hiển thị phần khai báo chỉ mục để tiết kiệm không gian
// Indexes với tên rõ ràng
ReviewSchema.index({ product: 1 }, { name: 'review_product_idx' });
ReviewSchema.index({ user: 1 }, { name: 'review_user_idx' });
ReviewSchema.index({ product: 1, createdAt: -1 }, { name: 'review_product_created_idx' });
ReviewSchema.index({ product: 1, rating: -1 }, { name: 'review_product_rating_idx' });
ReviewSchema.index(
  { product: 1, 'helpfulness.upvotes': -1 },
  { name: 'review_product_upvotes_idx' }
);
ReviewSchema.index({ 'moderation.status': 1 }, { name: 'review_moderation_status_idx' });
ReviewSchema.index(
  { product: 1, 'moderation.status': 1, isVisible: 1 },
  { name: 'review_product_moderation_visible_idx' }
);
ReviewSchema.index({ title: 'text', review: 'text' }, { name: 'review_text_search_idx' });

module.exports = mongoose.model('Review', ReviewSchema);
