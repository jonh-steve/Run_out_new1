// server/src/data/models/product.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Product Model
 * Schema MongoDB cho đối tượng sản phẩm
 */
const ProductSchema = new Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // Loại bỏ index: true tại đây
    },
    description: {
      short: {
        type: String,
        required: [true, 'Mô tả ngắn sản phẩm là bắt buộc'],
        trim: true,
        maxlength: [500, 'Mô tả ngắn không được vượt quá 500 ký tự'],
      },
      long: {
        type: String,
        trim: true,
      },
    },

    // Danh mục và phân loại
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Sản phẩm phải thuộc ít nhất một danh mục'],
      },
    ],
    tags: [String],

    // Thương hiệu và nguồn gốc
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    // Giá và tồn kho
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá sản phẩm không được âm'],
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, 'Giá khuyến mãi không được âm'],
    },
    currency: {
      type: String,
      default: 'VND',
    },
    stock: {
      type: Number,
      required: [true, 'Số lượng tồn kho là bắt buộc'],
      min: [0, 'Số lượng tồn kho không được âm'],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      // Loại bỏ index: true tại đây nếu có
    },

    // Hình ảnh sản phẩm
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Thuộc tính sản phẩm
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],

    // Đặc điểm sản phẩm
    features: [String],

    // Thông số kỹ thuật
    specifications: {
      weight: Number,
      length: Number,
      diameter: Number,
      material: String,
      tipSize: String,
      wrap: String,
    },

    // Kích thước và trọng lượng
    weight: {
      value: Number,
      unit: {
        type: String,
        default: 'g',
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm',
      },
    },

    // Bảo hành
    warranty: {
      type: String,
      trim: true,
    },

    // Đánh giá
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Thống kê
    soldCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },

    // Trạng thái
    status: {
      type: String,
      enum: {
        values: ['active', 'draft', 'discontinued'],
        message: 'Trạng thái phải là: active, draft hoặc discontinued',
      },
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },

    // Thông tin quản lý
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index cho tìm kiếm - giữ lại một chỉ mục text duy nhất
ProductSchema.index(
  {
    name: 'text',
    'description.short': 'text',
    'description.long': 'text',
    brand: 'text',
    'attributes.value': 'text',
  },
  {
    weights: {
      name: 10,
      'description.short': 5,
      'description.long': 3,
      brand: 3,
      'attributes.value': 2,
    },
    name: 'product_text_search_index', // Đặt tên rõ ràng để tránh xung đột
  }
);

// Tạo các index khác để tối ưu truy vấn
// Chỉ hiển thị phần khai báo chỉ mục để tiết kiệm không gian
// Tạo các index khác để tối ưu truy vấn
ProductSchema.index({ slug: 1 }, { unique: true, name: 'product_slug_unique_idx' });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true, name: 'product_sku_unique_idx' });
ProductSchema.index({ status: 1, categories: 1 }, { name: 'product_status_categories_idx' });
ProductSchema.index({ status: 1, price: 1 }, { name: 'product_status_price_idx' });
ProductSchema.index({ status: 1, createdAt: -1 }, { name: 'product_status_created_idx' });
ProductSchema.index({ categories: 1 }, { name: 'product_categories_idx' });
ProductSchema.index({ brand: 1 }, { name: 'product_brand_idx' });
ProductSchema.index({ featured: 1 }, { name: 'product_featured_idx' });
ProductSchema.index({ isPromoted: 1 }, { name: 'product_promoted_idx' });
ProductSchema.index({ 'ratings.average': -1, status: 1 }, { name: 'product_ratings_status_idx' });
ProductSchema.index(
  { status: 1, categories: 1, price: 1 },
  { name: 'product_status_categories_price_idx' }
);

// Virtual để lấy đánh giá
ProductSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'productId',
  localField: '_id',
});

// Phương thức để kiểm tra còn hàng
ProductSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Phương thức để tính giá sau giảm giá
ProductSchema.methods.getFinalPrice = function () {
  if (this.salePrice > 0 && this.salePrice < this.price) {
    return this.salePrice;
  }
  return this.price;
};

// Phương thức để tính phần trăm giảm giá
ProductSchema.methods.getDiscountPercentage = function () {
  if (this.salePrice > 0 && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
};

// Middleware trước khi lưu
ProductSchema.pre('save', function (next) {
  // Cập nhật ngày sửa đổi
  this.updatedAt = Date.now();
  next();
});

// Middleware sau khi tìm kiếm
ProductSchema.post('find', function (docs) {
  if (docs) {
    console.log(`Tìm thấy ${docs.length} sản phẩm`);
  }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
