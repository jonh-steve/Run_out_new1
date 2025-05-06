/**
 * Product Routes
 * Định nghĩa các routes liên quan đến sản phẩm
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, restrictTo } = require('../middleware/authMiddleware');

// Routes công khai
router.get('/', productController.getProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/new', productController.getNewProducts);
router.get('/sale', productController.getSaleProducts);
router.get('/search', productController.searchProducts);
router.get('/by-slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Routes theo danh mục
router.get('/category/:categoryId', productController.getProductsByCategory);

// Routes Admin (yêu cầu xác thực và phân quyền)
router.post('/', authenticate, restrictTo('admin'), productController.createProduct);

router.put('/:id', authenticate, restrictTo('admin'), productController.updateProduct);

router.delete('/:id', authenticate, restrictTo('admin'), productController.deleteProduct);

router.patch('/:id/stock', authenticate, restrictTo('admin'), productController.updateStock);

router.patch('/:id/status', authenticate, restrictTo('admin'), productController.updateStatus);

router.get('/stats', authenticate, restrictTo('admin'), productController.getProductStats);

module.exports = router;
