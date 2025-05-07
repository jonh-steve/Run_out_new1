/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Kiểm tra xem controller và middleware có tồn tại không
if (!productController) {
  throw new Error('productController không tồn tại');
}

if (!authMiddleware || !authMiddleware.authenticate || !authMiddleware.restrictTo) {
  throw new Error('authMiddleware không tồn tại hoặc thiếu các phương thức cần thiết');
}

// Kiểm tra từng phương thức controller
Object.entries(productController).forEach(([key, value]) => {
  if (typeof value !== 'function') {
    console.warn(`Cảnh báo: productController.${key} không phải là function`);
  }
});

// Routes công khai - các routes cụ thể đặt trước
router.get('/', productController.getProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/new', productController.getNewProducts);
router.get('/sale', productController.getSaleProducts);
router.get('/search', productController.searchProducts);
router.get('/by-slug/:slug', productController.getProductBySlug);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Routes Admin - đặt route /stats trước route /:id
// Kiểm tra cách sử dụng middleware
router.get(
  '/stats',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.getProductStats
);

// Routes liên quan đến ID cụ thể - đặt routes chi tiết trước
router.get('/:id/related', productController.getRelatedProducts);
router.post('/:id/view', productController.incrementProductView);

// Route lấy chi tiết sản phẩm theo ID - đặt sau các routes cụ thể hơn
router.get('/:id', productController.getProductById);

// Routes Admin cho các thao tác với sản phẩm cụ thể
router.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.createProduct
);
router.put(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.updateProduct
);
router.delete(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.deleteProduct
);
router.patch(
  '/:id/stock',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.updateStock
);
router.patch(
  '/:id/status',
  authMiddleware.authenticate,
  authMiddleware.restrictTo('admin'),
  productController.updateStatus
);

module.exports = router;
