/**
 * Cart Service
 * Xử lý logic nghiệp vụ cho giỏ hàng
 */

const { ApiError } = require('../../common/errors/apiError');
const cartRepository = require('../../data/repositories/cartRepository');
const productRepository = require('../../data/repositories/productRepository');
const crypto = require('crypto');

/**
 * Tạo ID phiên cho khách vãng lai
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Lấy giỏ hàng đang active của người dùng hoặc khách vãng lai
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @returns {Promise<Object>} Thông tin giỏ hàng
 */
const getActiveCart = async (userId, sessionId) => {
  let cart;

  // Trường hợp 1: User đã đăng nhập
  if (userId) {
    cart = await cartRepository.findOne({ user: userId, status: 'active' });
  }
  // Trường hợp 2: Khách vãng lai
  else if (sessionId) {
    cart = await cartRepository.findOne({ sessionId, status: 'active' });
  }

  // Nếu chưa có giỏ hàng, tạo mới
  if (!cart) {
    const newCart = {
      user: userId || null,
      sessionId: userId ? null : sessionId,
      items: [],
      subtotal: 0,
      status: 'active',
      lastActivity: new Date(),
    };

    // Thời hạn cho giỏ hàng của khách vãng lai
    if (!userId && sessionId) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 ngày
      newCart.expiresAt = expiryDate;
    }

    cart = await cartRepository.create(newCart);
  }

  return cart;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {string} productId - ID của sản phẩm
 * @param {number} quantity - Số lượng sản phẩm
 * @param {Object} attributes - Các thuộc tính tùy chọn của sản phẩm
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 * @throws {ApiError} Nếu có lỗi khi thêm sản phẩm
 */
const addItemToCart = async (userId, sessionId, productId, quantity, attributes = {}) => {
  // Kiểm tra sản phẩm tồn tại và còn hàng
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
  }

  if (!product.isActive) {
    throw new ApiError(400, 'Sản phẩm không khả dụng');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Sản phẩm chỉ còn ${product.stock} trong kho`);
  }

  // Lấy giỏ hàng hiện tại hoặc tạo mới
  const cart = await getActiveCart(userId, sessionId);

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItemIndex = cart.items.findIndex((item) => {
    return (
      item.product.toString() === productId &&
      JSON.stringify(item.attributes) === JSON.stringify(attributes)
    );
  });

  // Tính giá sản phẩm (ưu tiên giá khuyến mãi nếu có)
  const itemPrice = product.salePrice || product.price;

  // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
  if (existingItemIndex > -1) {
    const existingItem = cart.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    // Kiểm tra lại tồn kho
    if (product.stock < newQuantity) {
      throw new ApiError(400, `Không đủ hàng trong kho. Chỉ còn ${product.stock} sản phẩm.`);
    }

    // Cập nhật số lượng và tổng giá
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].updatedAt = new Date();
  }
  // Nếu chưa có, thêm mới vào giỏ hàng
  else {
    cart.items.push({
      product: productId,
      quantity,
      price: itemPrice,
      attributes,
      addedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Tính lại tổng tiền
  cart.subtotal = calculateSubtotal(cart.items);

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {string} itemId - ID của item trong giỏ hàng
 * @param {number} quantity - Số lượng mới
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 * @throws {ApiError} Nếu có lỗi khi cập nhật
 */
const updateCartItem = async (userId, sessionId, itemId, quantity) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Tìm item trong giỏ hàng
  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng');
  }

  // Lấy thông tin sản phẩm
  const cartItem = cart.items[itemIndex];
  const product = await productRepository.findById(cartItem.product);

  if (!product) {
    throw new ApiError(404, 'Sản phẩm không còn tồn tại');
  }

  // Kiểm tra tồn kho
  if (product.stock < quantity) {
    throw new ApiError(400, `Không đủ hàng trong kho. Chỉ còn ${product.stock} sản phẩm.`);
  }

  // Cập nhật số lượng
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].updatedAt = new Date();

  // Tính lại tổng tiền
  cart.subtotal = calculateSubtotal(cart.items);

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {string} itemId - ID của item trong giỏ hàng
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 * @throws {ApiError} Nếu có lỗi khi xóa sản phẩm
 */
const removeItemFromCart = async (userId, sessionId, itemId) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Kiểm tra item tồn tại trong giỏ hàng
  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng');
  }

  // Xóa item khỏi giỏ hàng
  cart.items.splice(itemIndex, 1);

  // Tính lại tổng tiền
  cart.subtotal = calculateSubtotal(cart.items);

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Xóa toàn bộ giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @returns {Promise<Object>} Giỏ hàng trống
 */
const clearCart = async (userId, sessionId) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Xóa tất cả items
  cart.items = [];
  cart.subtotal = 0;

  // Xóa mã giảm giá nếu có
  if (cart.coupon) {
    cart.coupon = null;
  }

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Áp dụng mã giảm giá vào giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {string} code - Mã giảm giá
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 * @throws {ApiError} Nếu mã giảm giá không hợp lệ
 */
const applyCoupon = async (userId, sessionId, code) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Kiểm tra giỏ hàng có sản phẩm không
  if (cart.items.length === 0) {
    throw new ApiError(400, 'Giỏ hàng trống, không thể áp dụng mã giảm giá');
  }

  // TODO: Triển khai logic xác thực mã giảm giá thực tế
  // Ví dụ đơn giản: kiểm tra mã "WELCOME10" giảm 10% tổng giá trị
  if (code === 'WELCOME10') {
    const discount = Math.round(cart.subtotal * 0.1); // Giảm 10%

    cart.coupon = {
      code,
      discount,
      appliedAt: new Date(),
    };

    // Cập nhật thời gian hoạt động
    cart.lastActivity = new Date();

    // Lưu giỏ hàng
    return await cartRepository.update(cart._id, cart);
  }

  throw new ApiError(400, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
};

/**
 * Xóa mã giảm giá khỏi giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 */
const removeCoupon = async (userId, sessionId) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Xóa mã giảm giá
  cart.coupon = null;

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Hợp nhất giỏ hàng khi đăng nhập
 * @param {string} userId - ID của người dùng đã đăng nhập
 * @param {string} sessionId - ID phiên của khách vãng lai
 * @returns {Promise<Object>} Giỏ hàng đã hợp nhất
 */
const mergeCartsOnLogin = async (userId, sessionId) => {
  // Tìm giỏ hàng của khách vãng lai
  const guestCart = await cartRepository.findOne({ sessionId, status: 'active' });

  if (!guestCart) {
    return await getActiveCart(userId, null);
  }

  // Tìm hoặc tạo giỏ hàng của người dùng
  const userCart = await getActiveCart(userId, null);

  // Nếu giỏ hàng khách không có sản phẩm, không cần hợp nhất
  if (guestCart.items.length === 0) {
    // Đánh dấu giỏ hàng khách là đã hợp nhất
    await cartRepository.update(guestCart._id, {
      status: 'merged',
      updatedAt: new Date(),
    });

    return userCart;
  }

  // Hợp nhất các sản phẩm từ giỏ hàng khách vào giỏ hàng người dùng
  for (const guestItem of guestCart.items) {
    const existingItemIndex = userCart.items.findIndex((item) => {
      return (
        item.product.toString() === guestItem.product.toString() &&
        JSON.stringify(item.attributes) === JSON.stringify(guestItem.attributes)
      );
    });

    // Nếu sản phẩm đã có trong giỏ hàng người dùng, cộng số lượng
    if (existingItemIndex > -1) {
      // Lấy thông tin sản phẩm để kiểm tra tồn kho
      const product = await productRepository.findById(guestItem.product);

      if (product) {
        const newQuantity = userCart.items[existingItemIndex].quantity + guestItem.quantity;

        // Kiểm tra tồn kho
        if (product.stock >= newQuantity) {
          userCart.items[existingItemIndex].quantity = newQuantity;
        } else {
          // Nếu không đủ tồn kho, giới hạn số lượng
          userCart.items[existingItemIndex].quantity = product.stock;
        }

        userCart.items[existingItemIndex].updatedAt = new Date();
      }
    }
    // Nếu sản phẩm chưa có, thêm vào giỏ hàng người dùng
    else {
      // Kiểm tra lại sản phẩm và tồn kho
      const product = await productRepository.findById(guestItem.product);

      if (product && product.isActive) {
        // Điều chỉnh số lượng nếu vượt quá tồn kho
        const quantity = product.stock >= guestItem.quantity ? guestItem.quantity : product.stock;

        if (quantity > 0) {
          userCart.items.push({
            ...guestItem,
            quantity,
            updatedAt: new Date(),
          });
        }
      }
    }
  }

  // Tính lại tổng tiền
  userCart.subtotal = calculateSubtotal(userCart.items);

  // Áp dụng mã giảm giá từ giỏ hàng khách nếu có và giỏ hàng người dùng chưa có
  if (guestCart.coupon && !userCart.coupon) {
    userCart.coupon = {
      ...guestCart.coupon,
      appliedAt: new Date(),
    };
  }

  // Cập nhật thời gian hoạt động
  userCart.lastActivity = new Date();

  // Lưu giỏ hàng người dùng
  const updatedUserCart = await cartRepository.update(userCart._id, userCart);

  // Đánh dấu giỏ hàng khách là đã hợp nhất
  await cartRepository.update(guestCart._id, {
    status: 'merged',
    updatedAt: new Date(),
  });

  return updatedUserCart;
};

/**
 * Tính tổng tiền giỏ hàng
 * @param {Array} items - Các sản phẩm trong giỏ hàng
 * @returns {number} Tổng tiền
 */
const calculateSubtotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Cập nhật thông tin vận chuyển cho giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {Object} shippingAddress - Thông tin địa chỉ giao hàng
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 */
const updateShippingAddress = async (userId, sessionId, shippingAddress) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Cập nhật địa chỉ giao hàng
  cart.shippingAddress = shippingAddress;

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Cập nhật phương thức vận chuyển cho giỏ hàng
 * @param {string|null} userId - ID của người dùng (null nếu là khách vãng lai)
 * @param {string|null} sessionId - ID phiên của khách vãng lai
 * @param {Object} shippingMethod - Thông tin phương thức vận chuyển
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 */
const updateShippingMethod = async (userId, sessionId, shippingMethod) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getActiveCart(userId, sessionId);

  // Cập nhật phương thức vận chuyển
  cart.shippingMethod = shippingMethod;

  // Cập nhật thời gian hoạt động
  cart.lastActivity = new Date();

  // Lưu giỏ hàng
  return await cartRepository.update(cart._id, cart);
};

/**
 * Đánh dấu giỏ hàng là đã bị bỏ rơi
 * @param {string} cartId - ID của giỏ hàng
 * @returns {Promise<Object>} Giỏ hàng đã cập nhật
 */
const markCartAsAbandoned = async (cartId) => {
  return await cartRepository.update(cartId, {
    status: 'abandoned',
    updatedAt: new Date(),
  });
};

/**
 * Lấy danh sách giỏ hàng bị bỏ rơi để gửi email nhắc nhở
 * @param {number} hoursSinceLastActivity - Số giờ kể từ lần hoạt động cuối cùng
 * @returns {Promise<Array>} Danh sách giỏ hàng bị bỏ rơi
 */
const getAbandonedCarts = async (hoursSinceLastActivity = 24) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursSinceLastActivity);

  return await cartRepository.find({
    status: 'active',
    lastActivity: { $lt: date },
    items: { $exists: true, $not: { $size: 0 } },
  });
};

module.exports = {
  generateSessionId,
  getActiveCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCartsOnLogin,
  updateShippingAddress,
  updateShippingMethod,
  markCartAsAbandoned,
  getAbandonedCarts,
};
