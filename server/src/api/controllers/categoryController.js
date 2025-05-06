/**
 * Category Controller
 * Xử lý các request liên quan đến danh mục sản phẩm
 */

const { catchAsync } = require('../../common/utils/catchAsync');
const { responseHandler } = require('../../common/utils/responseHandler');
const categoryService = require('../../services/category/categoryService');

/**
 * Lấy tất cả danh mục
 * @route GET /api/categories
 * @access Public
 */
const getAllCategories = catchAsync(async (req, res) => {
  const features = req.query;
  const categories = await categoryService.getAllCategories(features);
  return responseHandler.success(res, categories);
});

/**
 * Lấy danh mục theo ID
 * @route GET /api/categories/:id
 * @access Public
 */
const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  return responseHandler.success(res, category);
});

/**
 * Lấy tất cả sản phẩm trong danh mục
 * @route GET /api/categories/:id/products
 * @access Public
 */
const getCategoryProducts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const features = req.query;
  const products = await categoryService.getCategoryProducts(id, features);
  return responseHandler.success(res, products);
});

/**
 * Tạo danh mục mới
 * @route POST /api/categories
 * @access Private (Admin only)
 */
const createCategory = catchAsync(async (req, res) => {
  const categoryData = req.body;
  const newCategory = await categoryService.createCategory(categoryData);
  return responseHandler.created(res, newCategory);
});

/**
 * Cập nhật danh mục
 * @route PUT /api/categories/:id
 * @access Private (Admin only)
 */
const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const categoryData = req.body;
  const updatedCategory = await categoryService.updateCategory(id, categoryData);
  return responseHandler.success(res, updatedCategory);
});

/**
 * Xóa danh mục
 * @route DELETE /api/categories/:id
 * @access Private (Admin only)
 */
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);
  return responseHandler.success(res, { message: 'Danh mục đã được xóa thành công' });
});

/**
 * Lấy tất cả danh mục con
 * @route GET /api/categories/:id/subcategories
 * @access Public
 */
const getSubcategories = catchAsync(async (req, res) => {
  const { id } = req.params;
  const subcategories = await categoryService.getSubcategories(id);
  return responseHandler.success(res, subcategories);
});

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories
};