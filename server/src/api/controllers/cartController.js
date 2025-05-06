/**
 * Cart Controller
 * Xử lý các request liên quan đến giỏ hàng
 */

const { catchAsync } = require('../../common/utils/catchAsync');
const { responseHandler } = require('../../common/utils/responseHandler');
const cartService = require('../../services/cart/cartService');

/**
 * Lấy giỏ hàng hiện tại của người dùng đăng nhập hoặc khách
 * @route GET /api/carts/mycart
 * @access Public
 */
const getMyCart = catchAsync(async (req, res) => {
  let userId = null;
  let sessionId = null;
  
  // Nếu đã đăng nhập, lấy giỏ hàng theo userId
  if (req.user) {
    userId = req.user.id;
  } else {
    // Nếu chưa đăng nhập, lấy giỏ hàng theo sessionId
    sessionId = req.cookies.cartSessionId || req.body.sessionId;
    
    // Nếu chưa có sessionId, tạo mới
    if (!sessionId) {
      sessionId = cartService.generateSessionId();
      res.cookie('cartSessionId', sessionId, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        httpOnly: true
      });
    }
  }
  
  const cart = await cartService.getActiveCart(userId, sessionId);
  return responseHandler.success(res, cart);
});

/**
 * Thêm sản phẩm vào giỏ hàng
 * @route POST /api/carts/items
 * @access Public
 */
const addItemToCart = catchAsync(async (req, res) => {
  const { productId, quantity, attributes } = req.body;
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId || req.body.sessionId;
    
    if (!sessionId) {
      sessionId = cartService.generateSessionId();
      res.cookie('cartSessionId', sessionId, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
      });
    }
  }
  
  const updatedCart = await cartService.addItemToCart(
    userId,
    sessionId,
    productId,
    quantity,
    attributes
  );
  
  return responseHandler.success(res, updatedCart);
});

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @route PATCH /api/carts/items/:itemId
 * @access Public
 */
const updateCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      return responseHandler.badRequest(res, 'Cart session not found');
    }
  }
  
  const updatedCart = await cartService.updateCartItem(userId, sessionId, itemId, quantity);
  return responseHandler.success(res, updatedCart);
});

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @route DELETE /api/carts/items/:itemId
 * @access Public
 */
const removeCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      return responseHandler.badRequest(res, 'Cart session not found');
    }
  }
  
  const updatedCart = await cartService.removeItemFromCart(userId, sessionId, itemId);
  return responseHandler.success(res, updatedCart);
});

/**
 * Xóa toàn bộ giỏ hàng
 * @route DELETE /api/carts/mycart
 * @access Public
 */
const clearCart = catchAsync(async (req, res) => {
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      return responseHandler.badRequest(res, 'Cart session not found');
    }
  }
  
  await cartService.clearCart(userId, sessionId);
  return responseHandler.success(res, { message: 'Cart cleared successfully' });
});

/**
 * Áp dụng mã giảm giá vào giỏ hàng
 * @route POST /api/carts/apply-coupon
 * @access Public
 */
const applyCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      return responseHandler.badRequest(res, 'Cart session not found');
    }
  }
  
  const updatedCart = await cartService.applyCoupon(userId, sessionId, code);
  return responseHandler.success(res, updatedCart);
});

/**
 * Xóa mã giảm giá khỏi giỏ hàng
 * @route DELETE /api/carts/remove-coupon
 * @access Public
 */
const removeCoupon = catchAsync(async (req, res) => {
  let userId = null;
  let sessionId = null;
  
  if (req.user) {
    userId = req.user.id;
  } else {
    sessionId = req.cookies.cartSessionId;
    if (!sessionId) {
      return responseHandler.badRequest(res, 'Cart session not found');
    }
  }
  
  const updatedCart = await cartService.removeCoupon(userId, sessionId);
  return responseHandler.success(res, updatedCart);
});

/**
 * Hợp nhất giỏ hàng từ session với giỏ hàng người dùng khi đăng nhập
 * @route POST /api/carts/merge
 * @access Private
 */
const mergeCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return responseHandler.badRequest(res, 'Session ID is required');
  }
  
  const mergedCart = await cartService.mergeCartsOnLogin(userId, sessionId);
  
  // Xóa cookie giỏ hàng của session
  res.clearCookie('cartSessionId');
  
  return responseHandler.success(res, mergedCart);
});

module.exports = {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart
};