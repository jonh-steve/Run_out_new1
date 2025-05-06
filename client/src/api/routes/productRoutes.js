// server/src/api/routes/productRoutes.js

const express = require('express');
const productController = require('../controllers/productController');
const { authenticate } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const { productValidator } = require('../../common/validators/productValidator');

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', [authenticate, validate(productValidator.create)], productController.createProduct);
router.put('/:id', [authenticate, validate(productValidator.update)], productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;