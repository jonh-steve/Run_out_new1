// server/src/data/repositories/categoryRepository.js
const Category = require('../models/category.model');
const ApiError = require('../../common/errors/apiError');
// const mongoose = require('mongoose');

class CategoryRepository {
  async findAll(filter = {}, options = {}) {
    const { sort = { order: 1 }, limit = 0, page = 1, populate = [] } = options;
    const skip = (page - 1) * limit;

    const query = Category.find(filter).sort(sort);

    // Áp dụng pagination nếu limit > 0
    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const [categories, totalCount] = await Promise.all([
      query.exec(),
      Category.countDocuments(filter),
    ]);

    if (limit > 0) {
      return {
        data: categories,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    }

    return categories;
  }

  async findById(id, options = {}) {
    const { populate = [] } = options;

    const query = Category.findById(id);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const category = await query.exec();

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    return category;
  }

  async findBySlug(slug, options = {}) {
    const { populate = [] } = options;

    const query = Category.findOne({ slug });

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const category = await query.exec();

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    return category;
  }

  async create(data) {
    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await Category.findOne({ slug: data.slug }).exec();

    if (existingCategory) {
      throw new ApiError(409, 'Category with this slug already exists');
    }

    // Nếu có parent, cập nhật ancestors và level
    if (data.parent) {
      const parentCategory = await this.findById(data.parent);

      data.level = parentCategory.level + 1;
      data.ancestors = [
        ...parentCategory.ancestors,
        {
          _id: parentCategory._id,
          name: parentCategory.name,
          slug: parentCategory.slug,
        },
      ];
    } else {
      data.level = 0;
      data.ancestors = [];
    }

    const category = new Category(data);
    return await category.save();
  }

  async update(id, data) {
    // Nếu có cập nhật slug, kiểm tra slug đã tồn tại chưa
    if (data.slug) {
      const existingCategory = await Category.findOne({ slug: data.slug, _id: { $ne: id } }).exec();

      if (existingCategory) {
        throw new ApiError(409, 'Category with this slug already exists');
      }
    }

    // Nếu có thay đổi parent, cập nhật ancestors và level
    if (data.parent !== undefined) {
      if (data.parent) {
        const parentCategory = await this.findById(data.parent);

        // Kiểm tra parent không phải là con của category hiện tại
        if (parentCategory.ancestors.some((a) => a._id.toString() === id)) {
          throw new ApiError(400, 'Cannot set a child category as parent');
        }

        data.level = parentCategory.level + 1;
        data.ancestors = [
          ...parentCategory.ancestors,
          {
            _id: parentCategory._id,
            name: parentCategory.name,
            slug: parentCategory.slug,
          },
        ];
      } else {
        data.level = 0;
        data.ancestors = [];
      }
    }

    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Nếu category đã được cập nhật thành công và name hoặc slug đã thay đổi,
    // cần cập nhật ancestors cho tất cả các category con
    if (data.name || data.slug) {
      await this.updateChildrenAncestors(category);
    }

    return category;
  }

  async updateChildrenAncestors(parentCategory) {
    const childCategories = await Category.find({ parent: parentCategory._id });

    const updatePromises = childCategories.map(async (childCategory) => {
      // Cập nhật ancestors
      const ancestorIndex = childCategory.ancestors.findIndex(
        (a) => a._id.toString() === parentCategory._id.toString()
      );

      if (ancestorIndex !== -1) {
        childCategory.ancestors[ancestorIndex] = {
          _id: parentCategory._id,
          name: parentCategory.name,
          slug: parentCategory.slug,
        };

        await childCategory.save();

        // Cập nhật đệ quy cho con của childCategory
        await this.updateChildrenAncestors(childCategory);
      }
    });

    await Promise.all(updatePromises);
  }

  async delete(id) {
    // Kiểm tra xem category có con không
    const hasChildren = await Category.exists({ parent: id });

    if (hasChildren) {
      throw new ApiError(400, 'Cannot delete category with children');
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    return { success: true };
  }

  async getCategoryTree(filter = {}) {
    // Lấy tất cả categories
    const categories = await Category.find(filter).sort({ order: 1 }).lean();

    // Tạo map cho việc tìm kiếm nhanh
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id.toString()] = {
        ...category,
        children: [],
      };
    });

    // Xây dựng cây
    const rootCategories = [];

    categories.forEach((category) => {
      const categoryWithChildren = categoryMap[category._id.toString()];

      if (category.parent) {
        const parentId = category.parent.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  async getVisibleCategories() {
    return await this.getCategoryTree({ isActive: true, isVisible: true });
  }
}

module.exports = new CategoryRepository();
