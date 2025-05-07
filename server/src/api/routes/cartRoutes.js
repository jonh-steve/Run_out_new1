/**
 * Cart Routes
 * Định nghĩa các routes liên quan đến giỏ hàng
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const validate = require('../../common/middleware/validate');
const cartValidator = require('../../common/validators/cartValidator');
const { authenticate } = require('../middleware/authMiddleware');

// Routes không cần xác thực (có thể sử dụng cả khi đăng nhập và chưa đăng nhập)
router.get('/mycart', cartController.getMyCart);

router.post('/items', validate(cartValidator.addItemValidator), cartController.addItemToCart);

router.patch(
  '/items/:itemId',
  validate(cartValidator.updateItemValidator),
  cartController.updateCartItem
);

router.delete('/items/:itemId', cartController.removeCartItem);

router.delete('/mycart', cartController.clearCart);

router.post(
  '/apply-coupon',
  validate(cartValidator.applyCouponValidator),
  cartController.applyCoupon
);

router.delete('/remove-coupon', cartController.removeCoupon);

// Routes đòi hỏi xác thực
router.post(
  '/merge',
  authenticate(),
  validate(cartValidator.mergeCartsValidator),
  cartController.mergeCart
);

module.exports = router;
