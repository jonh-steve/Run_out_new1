/**
 * Category Service
 * Xử lý logic nghiệp vụ cho danh mục sản phẩm
 */

const { ApiError } = require('../../common/errors/apiError');
const categoryRepository = require('../../data/repositories/categoryRepository');
const productRepository = require('../../data/repositories/productRepository');
const slugify = require('slugify');

/**
 * Lấy tất cả danh mục (có thể lọc, sắp xếp, phân trang)
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Array>} Danh sách danh mục
 */
const getAllCategories = async (features = {}) => {
  return await categoryRepository.findAll(features);
};

/**
 * Lấy danh mục theo ID
 * @param {string} id - ID của danh mục
 * @returns {Promise<Object>} Thông tin danh mục
 * @throws {ApiError} Nếu không tìm thấy danh mục
 */
const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'Không tìm thấy danh mục');
  }
  return category;
};

/**
 * Lấy danh mục theo slug
 * @param {string} slug - Slug của danh mục
 * @returns {Promise<Object>} Thông tin danh mục
 * @throws {ApiError} Nếu không tìm thấy danh mục
 */
const getCategoryBySlug = async (slug) => {
  const category = await categoryRepository.findOne({ slug });
  if (!category) {
    throw new ApiError(404, 'Không tìm thấy danh mục');
  }
  return category;
};

/**
 * Lấy tất cả sản phẩm trong danh mục
 * @param {string} categoryId - ID của danh mục
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Array>} Danh sách sản phẩm trong danh mục
 */
const getCategoryProducts = async (categoryId, features = {}) => {
  // Kiểm tra danh mục tồn tại
  const category = await getCategoryById(categoryId);
  
  // Thêm filter cho category vào features
  const categoryFilter = { ...features };
  categoryFilter.filter = { ...categoryFilter.filter, category: categoryId };
  
  // Lấy tất cả các danh mục con
  const subcategories = await getSubcategories(categoryId);
  
  // Nếu có danh mục con, thêm vào filter
  if (subcategories.length > 0) {
    const subcategoryIds = subcategories.map(subcat => subcat._id);
    categoryFilter.filter = { 
      ...categoryFilter.filter, 
      $or: [
        { category: categoryId },
        { category: { $in: subcategoryIds } }
      ]
    };
  }
  
  return await productRepository.findAll(categoryFilter);
};

/**
 * Tạo danh mục mới
 * @param {Object} categoryData - Dữ liệu danh mục
 * @returns {Promise<Object>} Danh mục đã tạo
 */
const createCategory = async (categoryData) => {
  // Nếu không có slug, tạo từ tên
  if (!categoryData.slug) {
    categoryData.slug = slugify(categoryData.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
  }
  
  // Kiểm tra slug đã tồn tại chưa
  const existingCategory = await categoryRepository.findOne({ slug: categoryData.slug });
  if (existingCategory) {
    throw new ApiError(400, 'Slug đã tồn tại');
  }
  
  // Xử lý danh mục cha và ancestors
  if (categoryData.parent) {
    const parentCategory = await getCategoryById(categoryData.parent);
    
    // Thiết lập level và ancestors
    categoryData.level = parentCategory.level + 1;
    categoryData.ancestors = [
      ...parentCategory.ancestors,
      {
        _id: parentCategory._id,
        name: parentCategory.name,
        slug: parentCategory.slug
      }
    ];
  } else {
    // Danh mục gốc
    categoryData.level = 0;
    categoryData.ancestors = [];
  }
  
  return await categoryRepository.create(categoryData);
};

/**
 * Cập nhật danh mục
 * @param {string} id - ID của danh mục
 * @param {Object} categoryData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Danh mục đã cập nhật
 * @throws {ApiError} Nếu không tìm thấy danh mục
 */
const updateCategory = async (id, categoryData) => {
  // Kiểm tra danh mục tồn tại
  const category = await getCategoryById(id);
  
  // Nếu thay đổi tên và không cung cấp slug, cập nhật slug
  if (categoryData.name && !categoryData.slug) {
    categoryData.slug = slugify(categoryData.name, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
  }
  
  // Kiểm tra slug mới có bị trùng không
  if (categoryData.slug && categoryData.slug !== category.slug) {
    const existingCategory = await categoryRepository.findOne({ 
      slug: categoryData.slug,
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      throw new ApiError(400, 'Slug đã tồn tại');
    }
  }
  
  // Nếu thay đổi danh mục cha
  if (categoryData.parent !== undefined && categoryData.parent !== category.parent) {
    // Không cho phép đặt danh mục con làm cha của chính nó
    const subcategories = await getSubcategories(id);
    const subcategoryIds = subcategories.map(subcat => subcat._id.toString());
    
    if (categoryData.parent && (categoryData.parent === id || subcategoryIds.includes(categoryData.parent))) {
      throw new ApiError(400, 'Không thể đặt danh mục con làm cha của chính nó');
    }
    
    // Cập nhật level và ancestors
    if (categoryData.parent) {
      const parentCategory = await getCategoryById(categoryData.parent);
      
      categoryData.level = parentCategory.level + 1;
      categoryData.ancestors = [
        ...parentCategory.ancestors,
        {
          _id: parentCategory._id,
          name: parentCategory.name,
          slug: parentCategory.slug
        }
      ];
    } else {
      // Chuyển thành danh mục gốc
      categoryData.level = 0;
      categoryData.ancestors = [];
    }
    
    // Cập nhật tất cả danh mục con
    await updateSubcategoryAncestors(id, category.name, category.slug);
  }
  
  // Cập nhật danh mục
  const updatedCategory = await categoryRepository.update(id, categoryData);
  
  // Nếu thay đổi tên hoặc slug, cập nhật ancestors cho tất cả danh mục con
  if ((categoryData.name && categoryData.name !== category.name) ||
      (categoryData.slug && categoryData.slug !== category.slug)) {
    await updateSubcategoryAncestors(id, updatedCategory.name, updatedCategory.slug);
  }
  
  return updatedCategory;
};

/**
 * Xóa danh mục
 * @param {string} id - ID của danh mục
 * @returns {Promise<void>}
 * @throws {ApiError} Nếu không tìm thấy danh mục hoặc có danh mục con
 */
const deleteCategory = async (id) => {
  // Kiểm tra danh mục tồn tại
  const category = await getCategoryById(id);
  
  // Kiểm tra nếu có danh mục con
  const subcategories = await categoryRepository.find({ parent: id });
  if (subcategories.length > 0) {
    throw new ApiError(400, 'Không thể xóa danh mục có danh mục con');
  }
  
  // Kiểm tra nếu có sản phẩm trong danh mục
  const products = await productRepository.find({ category: id }, { limit: 1 });
  if (products.length > 0) {
    throw new ApiError(400, 'Không thể xóa danh mục có sản phẩm');
  }
  
  // Xóa danh mục
  await categoryRepository.delete(id);
};

/**
 * Lấy tất cả danh mục con trực tiếp
 * @param {string} parentId - ID của danh mục cha
 * @returns {Promise<Array>} Danh sách danh mục con
 */
const getDirectSubcategories = async (parentId) => {
  return await categoryRepository.find({ parent: parentId });
};

/**
 * Lấy tất cả danh mục con (bao gồm cả con của con)
 * @param {string} categoryId - ID của danh mục
 * @returns {Promise<Array>} Danh sách tất cả danh mục con
 */
const getSubcategories = async (categoryId) => {
  return await categoryRepository.findSubcategories(categoryId);
};

/**
 * Cập nhật ancestors cho tất cả danh mục con khi danh mục cha thay đổi
 * @param {string} categoryId - ID của danh mục cha
 * @param {string} categoryName - Tên mới của danh mục cha
 * @param {string} categorySlug - Slug mới của danh mục cha
 * @returns {Promise<void>}
 */
const updateSubcategoryAncestors = async (categoryId, categoryName, categorySlug) => {
  // Lấy tất cả danh mục con trực tiếp
  const directSubcategories = await getDirectSubcategories(categoryId);
  
  // Cập nhật ancestors cho từng danh mục con
  for (const subcategory of directSubcategories) {
    // Tìm vị trí của danh mục cha trong ancestors
    const ancestorIndex = subcategory.ancestors.findIndex(
      ancestor => ancestor._id.toString() === categoryId
    );
    
    if (ancestorIndex !== -1) {
      // Cập nhật thông tin ancestor
      const updatedAncestors = [...subcategory.ancestors];
      updatedAncestors[ancestorIndex] = {
        _id: categoryId,
        name: categoryName,
        slug: categorySlug
      };
      
      // Cập nhật danh mục con
      await categoryRepository.update(subcategory._id, {
        ancestors: updatedAncestors
      });
      
      // Đệ quy cập nhật các danh mục con của con
      await updateSubcategoryAncestors(
        subcategory._id,
        subcategory.name,
        subcategory.slug
      );
    }
  }
};

/**
 * Tạo breadcrumbs từ ancestors
 * @param {string} categoryId - ID của danh mục
 * @returns {Promise<Array>} Danh sách breadcrumbs
 */
const createBreadcrumbs = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  
  // Tạo breadcrumbs từ ancestors và thêm danh mục hiện tại
  const breadcrumbs = [
    ...category.ancestors.map(ancestor => ({
      id: ancestor._id,
      name: ancestor.name,
      slug: ancestor.slug
    })),
    {
      id: category._id,
      name: category.name,
      slug: category.slug
    }
  ];
  
  return breadcrumbs;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  getDirectSubcategories,
  getSubcategories,
  createBreadcrumbs
};