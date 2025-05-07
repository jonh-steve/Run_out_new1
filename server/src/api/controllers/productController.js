/**
 * ProductController
 * Xử lý các request API liên quan đến sản phẩm
 */

const productService = require('../../services/product/productService');
const catchAsync = require('../../common/utils/catchAsync');
const responseHandler = require('../../common/utils/responseHandler');
const AppError = require('../../common/errors/apiError');

// Tạo đối tượng controller
const productController = {
  /**
   * Lấy danh sách sản phẩm
   * @route GET /api/products
   * @access Public
   */
  getProducts: catchAsync(async (req, res) => {
    const result = await productService.getProducts(req.query);
    responseHandler.success(res, {
      products: result.products,
      totalCount: result.totalCount,
      pagination: result.pagination,
    });
  }),

  /**
   * Lấy chi tiết sản phẩm
   * @route GET /api/products/:id
   * @access Public
   */
  getProductById: catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    responseHandler.success(res, { product });
  }),

  /**
   * Lấy sản phẩm theo slug
   * @route GET /api/products/by-slug/:slug
   * @access Public
   */
  getProductBySlug: catchAsync(async (req, res) => {
    // Sử dụng getProducts với filter theo slug
    const result = await productService.getProducts({
      slug: req.params.slug,
      limit: 1,
    });

    if (!result.products || result.products.length === 0) {
      throw new AppError(404, 'Không tìm thấy sản phẩm');
    }

    // Lấy sản phẩm đầu tiên từ kết quả
    const product = result.products[0];

    // Lấy thêm thông tin chi tiết nếu cần
    const detailedProduct = await productService.getProductById(product.id);

    responseHandler.success(res, { product: detailedProduct });
  }),

  /**
   * Lấy sản phẩm theo danh mục
   * @route GET /api/categories/:categoryId/products
   * @access Public
   */
  getProductsByCategory: catchAsync(async (req, res) => {
    const { categoryId } = req.params;
    const result = await productService.getProductsByCategory(categoryId, req.query);
    responseHandler.success(res, {
      category: result.category,
      products: result.products,
      totalCount: result.totalCount,
      pagination: result.pagination,
    });
  }),

  /**
   * Lấy sản phẩm nổi bật
   * @route GET /api/products/trending
   * @access Public
   */
  getTrendingProducts: catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getTrendingProducts(limit);
    responseHandler.success(res, { products });
  }),

  /**
   * Lấy sản phẩm mới
   * @route GET /api/products/new
   * @access Public
   */
  getNewProducts: catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    // Sử dụng getProducts với sắp xếp theo ngày tạo mới nhất
    const result = await productService.getProducts({
      limit,
      sort: { createdAt: -1 },
      status: 'active',
    });

    responseHandler.success(res, { products: result.products });
  }),

  /**
   * Lấy sản phẩm giảm giá
   * @route GET /api/products/sale
   * @access Public
   */
  getSaleProducts: catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    // Sử dụng getProducts với bộ lọc cho sản phẩm có giá khuyến mãi
    const result = await productService.getProducts({
      limit,
      filters: { salePrice: { $gt: 0 } },
      sort: { salePrice: 1 }, // Sắp xếp theo giá khuyến mãi tăng dần
      status: 'active',
    });

    responseHandler.success(res, { products: result.products });
  }),

  /**
   * Tìm kiếm sản phẩm
   * @route GET /api/products/search
   * @access Public
   */
  searchProducts: catchAsync(async (req, res) => {
    const { q } = req.query;
    if (!q) {
      throw new AppError(400, 'Vui lòng cung cấp từ khóa tìm kiếm');
    }

    const options = {
      limit: parseInt(req.query.limit) || 10,
      page: parseInt(req.query.page) || 1,
      sort: req.query.sort ? JSON.parse(req.query.sort) : { newest: -1 },
      filters: req.query.filters ? JSON.parse(req.query.filters) : {},
    };

    const result = await productService.searchProducts(q, options);
    responseHandler.success(res, result);
  }),

  /**
   * Tạo sản phẩm mới (Admin)
   * @route POST /api/admin/products
   * @access Private/Admin
   */
  createProduct: catchAsync(async (req, res) => {
    const userId = req.user.id;
    const product = await productService.createProduct(req.body, userId);
    responseHandler.created(res, { product });
  }),

  /**
   * Cập nhật sản phẩm (Admin)
   * @route PUT /api/admin/products/:id
   * @access Private/Admin
   */
  updateProduct: catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body, userId);
    responseHandler.success(res, { product });
  }),

  /**
   * Xóa sản phẩm (Admin)
   * @route DELETE /api/admin/products/:id
   * @access Private/Admin
   */
  deleteProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    await productService.deleteProduct(id);
    responseHandler.success(res, { message: 'Sản phẩm đã được xóa thành công' });
  }),

  /**
   * Cập nhật tồn kho (Admin)
   * @route PATCH /api/admin/products/:id/stock
   * @access Private/Admin
   */
  updateStock: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      throw new AppError(400, 'Vui lòng cung cấp số lượng tồn kho');
    }

    const result = await productService.updateStock(id, parseInt(quantity));
    responseHandler.success(res, result);
  }),

  /**
   * Cập nhật trạng thái sản phẩm (Admin)
   * @route PATCH /api/admin/products/:id/status
   * @access Private/Admin
   */
  updateStatus: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError(400, 'Vui lòng cung cấp trạng thái');
    }

    const allowedStatuses = ['active', 'draft', 'discontinued'];
    if (!allowedStatuses.includes(status)) {
      throw new AppError(
        400,
        `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${allowedStatuses.join(', ')}`
      );
    }

    const product = await productService.updateProduct(id, { status }, req.user.id);
    responseHandler.success(res, { product });
  }),

  /**
   * Lấy thống kê sản phẩm (Admin)
   * @route GET /api/admin/products/stats
   * @access Private/Admin
   */
  getProductStats: catchAsync(async (req, res) => {
    const stats = await productService.getProductStats();
    responseHandler.success(res, { stats });
  }),

  /**
   * Lấy sản phẩm liên quan
   * @route GET /api/products/:id/related
   * @access Public
   */
  getRelatedProducts: catchAsync(async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const products = await productService.getRelatedProducts(id, limit);
    responseHandler.success(res, { products });
  }),

  /**
   * Tăng số lượt xem sản phẩm
   * @route POST /api/products/:id/view
   * @access Public
   */
  incrementProductView: catchAsync(async (req, res) => {
    const { id } = req.params;
    await productService.incrementViewCount(id);
    responseHandler.success(res, { message: 'Đã cập nhật lượt xem' });
  }),
};

// Xuất controller
module.exports = productController;
