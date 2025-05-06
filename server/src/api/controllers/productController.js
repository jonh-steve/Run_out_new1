/**
 * ProductController
 * Xử lý các request API liên quan đến sản phẩm
 */

const productService = require('../../services/product/productService');
const catchAsync = require('../../common/utils/catchAsync');
const responseHandler = require('../../common/utils/responseHandler');
const AppError = require('../../common/errors/apiError');

/**
 * Lấy danh sách sản phẩm
 * @route GET /api/products
 * @access Public
 */
exports.getProducts = catchAsync(async (req, res) => {
  const result = await productService.getProducts(req.query);
  responseHandler.success(res, {
    products: result.products,
    totalCount: result.totalCount,
    pagination: result.pagination,
  });
});

/**
 * Lấy chi tiết sản phẩm
 * @route GET /api/products/:id
 * @access Public
 */
exports.getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  responseHandler.success(res, { product });
});

/**
 * Lấy sản phẩm theo slug
 * @route GET /api/products/by-slug/:slug
 * @access Public
 */
exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  responseHandler.success(res, { product });
});

/**
 * Lấy sản phẩm theo danh mục
 * @route GET /api/categories/:categoryId/products
 * @access Public
 */
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await productService.getProductsByCategory(categoryId, req.query);
  responseHandler.success(res, {
    category: result.category,
    products: result.products,
    totalCount: result.totalCount,
    pagination: result.pagination,
  });
});

/**
 * Lấy sản phẩm nổi bật
 * @route GET /api/products/trending
 * @access Public
 */
exports.getTrendingProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getTrendingProducts(limit);
  responseHandler.success(res, { products });
});

/**
 * Lấy sản phẩm mới
 * @route GET /api/products/new
 * @access Public
 */
exports.getNewProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getNewestProducts(limit);
  responseHandler.success(res, { products });
});

/**
 * Lấy sản phẩm giảm giá
 * @route GET /api/products/sale
 * @access Public
 */
exports.getSaleProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getSaleProducts(limit);
  responseHandler.success(res, { products });
});

/**
 * Tìm kiếm sản phẩm
 * @route GET /api/products/search
 * @access Public
 */
exports.searchProducts = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new AppError('Vui lòng cung cấp từ khóa tìm kiếm', 400);
  }

  const options = {
    limit: parseInt(req.query.limit) || 10,
    page: parseInt(req.query.page) || 1,
    sort: req.query.sort ? JSON.parse(req.query.sort) : { newest: -1 },
    filters: req.query.filters ? JSON.parse(req.query.filters) : {},
  };

  const result = await productService.searchProducts(q, options);
  responseHandler.success(res, result);
});

/**
 * Tạo sản phẩm mới (Admin)
 * @route POST /api/admin/products
 * @access Private/Admin
 */
exports.createProduct = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const product = await productService.createProduct(req.body, userId);
  responseHandler.created(res, { product });
});

/**
 * Cập nhật sản phẩm (Admin)
 * @route PUT /api/admin/products/:id
 * @access Private/Admin
 */
exports.updateProduct = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const product = await productService.updateProduct(id, req.body, userId);
  responseHandler.success(res, { product });
});

/**
 * Xóa sản phẩm (Admin)
 * @route DELETE /api/admin/products/:id
 * @access Private/Admin
 */
exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  await productService.deleteProduct(id);
  responseHandler.success(res, { message: 'Sản phẩm đã được xóa thành công' });
});

/**
 * Cập nhật tồn kho (Admin)
 * @route PATCH /api/admin/products/:id/stock
 * @access Private/Admin
 */
exports.updateStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    throw new AppError('Vui lòng cung cấp số lượng tồn kho', 400);
  }

  const result = await productService.updateStock(id, parseInt(quantity));
  responseHandler.success(res, result);
});

/**
 * Cập nhật trạng thái sản phẩm (Admin)
 * @route PATCH /api/admin/products/:id/status
 * @access Private/Admin
 */
exports.updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError('Vui lòng cung cấp trạng thái', 400);
  }

  const allowedStatuses = ['active', 'draft', 'discontinued'];
  if (!allowedStatuses.includes(status)) {
    throw new AppError(
      `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${allowedStatuses.join(', ')}`,
      400
    );
  }

  const product = await productService.updateProduct(id, { status }, req.user.id);
  responseHandler.success(res, { product });
});

/**
 * Lấy thống kê sản phẩm (Admin)
 * @route GET /api/admin/products/stats
 * @access Private/Admin
 */
exports.getProductStats = catchAsync(async (req, res) => {
  const stats = await productService.getProductStats();
  responseHandler.success(res, { stats });
});
