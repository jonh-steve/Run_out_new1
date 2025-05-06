// server/src/data/models/category.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,

    // Cấu trúc phân cấp
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    ancestors: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
        name: String,
        slug: String,
      },
    ],
    level: {
      type: Number,
      default: 0,
    },

    // Hiển thị
    image: {
      url: String,
      alt: String,
    },
    icon: String,

    // Thứ tự và trạng thái
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes với tên rõ ràng
CategorySchema.index({ name: 1 }, { name: 'category_name_idx' });
CategorySchema.index({ slug: 1 }, { unique: true, name: 'category_slug_unique_idx' });
CategorySchema.index({ parent: 1 }, { name: 'category_parent_idx' });
CategorySchema.index({ 'ancestors._id': 1 }, { name: 'category_ancestors_idx' });
CategorySchema.index({ level: 1 }, { name: 'category_level_idx' });
CategorySchema.index({ order: 1 }, { name: 'category_order_idx' });
CategorySchema.index({ isActive: 1, isVisible: 1 }, { name: 'category_active_visible_idx' });
CategorySchema.index({ name: 'text', description: 'text' }, { name: 'category_text_search_idx' });

module.exports = mongoose.model('Category', CategorySchema);
