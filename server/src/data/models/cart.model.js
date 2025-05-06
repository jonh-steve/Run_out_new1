// server/src/data/models/cart.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    // Thông tin chủ sở hữu
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Bỏ sparse: true ở đây, chỉ để lại trong khai báo index
    },
    sessionId: {
      type: String,
      // Bỏ sparse: true ở đây, chỉ để lại trong khai báo index
    },

    // Danh sách sản phẩm
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        attributes: {
          type: Object,
          default: {},
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: Date,
      },
    ],

    // Tính toán giá
    subtotal: {
      type: Number,
      default: 0,
    },

    // Mã giảm giá
    coupon: {
      code: String,
      discount: Number,
      appliedAt: Date,
    },

    // Trạng thái
    status: {
      type: String,
      enum: ['active', 'converted', 'abandoned', 'merged'],
      default: 'active',
    },

    // Thời gian hoạt động và hết hạn
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      // Bỏ sparse: true ở đây, chỉ để lại trong khai báo index
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - Giữ lại các khai báo chỉ mục rõ ràng và thêm tên
CartSchema.index({ user: 1 }, { sparse: true, name: 'cart_user_idx' });
CartSchema.index({ sessionId: 1 }, { sparse: true, name: 'cart_sessionId_idx' });
CartSchema.index({ status: 1 }, { name: 'cart_status_idx' });
CartSchema.index({ user: 1, status: 1 }, { name: 'cart_user_status_idx' });
CartSchema.index({ sessionId: 1, status: 1 }, { sparse: true, name: 'cart_sessionId_status_idx' });
CartSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, sparse: true, name: 'cart_expiresAt_ttl_idx' }
);
CartSchema.index({ 'items.product': 1 }, { name: 'cart_items_product_idx' });

module.exports = mongoose.model('Cart', CartSchema);
