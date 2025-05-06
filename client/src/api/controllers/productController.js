// server/src/api/controllers/productController.js

const { Product } = require('../../data/models/product.model');
const productRepository = require('../../data/repositories/productRepository');
const ApiError = require('../../middleware/apiError');
const catchAsync = require('../../utils/catchAsync');
const responseHandler = require('../../utils/responseHandler');

/**
 * Lấy danh sách sản phẩm với pagination và filter
 */
exports.getProducts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const sort = req.query.sort || '-createdAt';
  
  // Xây dựng filter từ query params
  const filter = {};
  
  // Lọc theo danh mục
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  // Lọc theo giá
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  // Lọc theo thương hiệu
  if (req.query.brand) {
    filter.brand = req.query.brand;
  }
  
  // Lọc theo tình trạng tồn kho
  if (req.query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }
  
  // Mặc định chỉ hiển thị sản phẩm active
  filter.isActive = true;
  
  const result = await productRepository.findAll(filter, {
    page,
    limit,
    sort,
    populate: 'category'
  });
  
  responseHandler.success(res, {
    data: result.data,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    totalItems: result.totalItems
  });
});

/**
 * Lấy chi tiết sản phẩm theo ID
 */
exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await productRepository.findById(id, {
    populate: 'category'
  });
  
  if (!product) {
    return next(new ApiError(404, 'Không tìm thấy sản phẩm'));
  }
  
  responseHandler.success(res, product);
});

/**
 * Lấy sản phẩm theo danh mục
 */
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const sort = req.query.sort || '-createdAt';
  
  const filter = {
    category: categoryId,
    isActive: true
  };
  
  // Áp dụng các filter khác nếu có
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  const result = await productRepository.findAll(filter, {
    page,
    limit,
    sort
  });
  
  responseHandler.success(res, {
    data: result.data,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    totalItems: result.totalItems
  });
});

/**
 * Tìm kiếm sản phẩm
 */
exports.searchProducts = catchAsync(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  
  if (!q) {
    return responseHandler.success(res, {
      data: [],
      totalPages: 0,
      currentPage: page,
      totalItems: 0
    });
  }
  
  const result = await productRepository.search(q, {
    page,
    limit
  });
  
  responseHandler.success(res, {
    data: result.data,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    totalItems: result.totalItems
  });
});