// server/src/data/models/order.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    // Thông tin cơ bản
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      // Không cần khai báo index: true ở đây vì đã có trong schema.index()
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Không cần khai báo index: true ở đây vì đã có trong schema.index()
    },

    // Thông tin liên hệ
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },

    // Chi tiết sản phẩm
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        attributes: {
          type: Object,
          default: {},
        },
        sku: String,
        image: String,
      },
    ],

    // Tổng tiền
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
      },
      code: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Thông tin vận chuyển
    shippingAddress: {
      name: String,
      phone: String,
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      notes: String,
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    trackingNumber: String,

    // Thông tin thanh toán
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentDetails: {
      provider: String,
      transactionId: String,
      paymentDate: Date,
    },

    // Trạng thái đơn hàng
    status: {
      type: String,
      enum: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },

    // Lịch sử trạng thái
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'processing',
            'packed',
            'shipped',
            'delivered',
            'cancelled',
            'returned',
          ],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Ghi chú
    customerNotes: String,
    adminNotes: String,

    // Thời gian hoàn thành hoặc hủy
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
// Chỉ hiển thị phần khai báo chỉ mục để tiết kiệm không gian
// Indexes với tên rõ ràng
OrderSchema.index({ orderNumber: 1 }, { unique: true, name: 'order_number_unique_idx' });
OrderSchema.index({ user: 1 }, { name: 'order_user_idx' });
OrderSchema.index({ 'customerInfo.email': 1 }, { name: 'order_customer_email_idx' });
OrderSchema.index({ 'customerInfo.phone': 1 }, { name: 'order_customer_phone_idx' });
OrderSchema.index({ status: 1 }, { name: 'order_status_idx' });
OrderSchema.index({ paymentStatus: 1 }, { name: 'order_payment_status_idx' });
OrderSchema.index({ createdAt: -1 }, { name: 'order_created_desc_idx' });
OrderSchema.index({ completedAt: -1 }, { name: 'order_completed_desc_idx' });
OrderSchema.index({ user: 1, createdAt: -1 }, { name: 'order_user_created_idx' });
OrderSchema.index({ status: 1, createdAt: -1 }, { name: 'order_status_created_idx' });
OrderSchema.index({ 'items.product': 1 }, { name: 'order_items_product_idx' });
module.exports = mongoose.model('Order', OrderSchema);
