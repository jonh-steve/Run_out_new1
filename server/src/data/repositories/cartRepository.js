// server/src/data/repositories/cartRepository.js
const Cart = require('../models/cart.model');
const ApiError = require('../../common/errors/apiError');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class CartRepository {
  async findByUser(userId, options = {}) {
    const { populate = [] } = options;

    const query = Cart.findOne({ user: userId, status: 'active' });

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    return await query.exec();
  }

  async findBySessionId(sessionId, options = {}) {
    const { populate = [] } = options;

    const query = Cart.findOne({ sessionId, status: 'active' });

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    return await query.exec();
  }

  async findById(id, options = {}) {
    const { populate = [] } = options;

    const query = Cart.findById(id);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const cart = await query.exec();

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    return cart;
  }

  async create(data) {
    const cart = new Cart({
      ...data,
      status: 'active',
      lastActivity: new Date(),
    });

    // Nếu là giỏ hàng khách vãng lai, đặt thời gian hết hạn
    if (data.sessionId && !data.user) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      cart.expiresAt = expiryDate;
    }

    return await cart.save();
  }

  async addItem(cartId, item) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra tồn kho
      const product = await Product.findById(item.product);

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      // Lấy giỏ hàng
      const cart = await Cart.findById(cartId);

      if (!cart) {
        throw new ApiError(404, 'Cart not found');
      }

      // Tìm sản phẩm trong giỏ hàng
      const existingItemIndex = cart.items.findIndex(
        (cartItem) =>
          cartItem.product.toString() === item.product.toString() &&
          JSON.stringify(cartItem.attributes || {}) === JSON.stringify(item.attributes || {})
      );

      const now = new Date();

      if (existingItemIndex > -1) {
        // Cập nhật sản phẩm đã có
        const newQuantity = cart.items[existingItemIndex].quantity + item.quantity;

        if (product.stock < newQuantity) {
          throw new ApiError(400, 'Insufficient stock');
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].updatedAt = now;
      } else {
        // Thêm sản phẩm mới vào giỏ hàng
        cart.items.push({
          product: item.product,
          quantity: item.quantity,
          price: product.salePrice || product.price,
          attributes: item.attributes || {},
          addedAt: now,
          updatedAt: now,
        });
      }

      // Cập nhật tổng tiền
      cart.subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Cập nhật timestamps
      cart.updatedAt = now;
      cart.lastActivity = now;

      // Lưu giỏ hàng
      await cart.save({ session });

      await session.commitTransaction();
      return cart;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateItemQuantity(cartId, productId, quantity, attributes = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra tồn kho
      const product = await Product.findById(productId);

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (product.stock < quantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      // Lấy giỏ hàng
      const cart = await Cart.findById(cartId);

      if (!cart) {
        throw new ApiError(404, 'Cart not found');
      }

      // Tìm sản phẩm trong giỏ hàng
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId.toString() &&
          JSON.stringify(item.attributes || {}) === JSON.stringify(attributes)
      );

      if (itemIndex === -1) {
        throw new ApiError(404, 'Product not found in cart');
      }

      const now = new Date();

      if (quantity <= 0) {
        // Xóa sản phẩm khỏi giỏ hàng
        cart.items.splice(itemIndex, 1);
      } else {
        // Cập nhật số lượng
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].updatedAt = now;
      }

      // Cập nhật tổng tiền
      cart.subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Cập nhật timestamps
      cart.updatedAt = now;
      cart.lastActivity = now;

      // Lưu giỏ hàng
      await cart.save({ session });

      await session.commitTransaction();
      return cart;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeItem(cartId, productId, attributes = {}) {
    return await this.updateItemQuantity(cartId, productId, 0, attributes);
  }

  async clear(cartId) {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.coupon = undefined;
    cart.updatedAt = new Date();
    cart.lastActivity = new Date();

    return await cart.save();
  }

  async applyCoupon(cartId, couponCode, discount) {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.coupon = {
      code: couponCode,
      discount,
      appliedAt: new Date(),
    };

    cart.updatedAt = new Date();
    cart.lastActivity = new Date();

    return await cart.save();
  }

  async removeCoupon(cartId) {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.coupon = undefined;
    cart.updatedAt = new Date();
    cart.lastActivity = new Date();

    return await cart.save();
  }

  async mergeGuestCart(userId, sessionId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tìm giỏ hàng guest
      const guestCart = await Cart.findOne({ sessionId, status: 'active' });

      // Nếu không có giỏ hàng guest, không cần hợp nhất
      if (!guestCart) {
        await session.commitTransaction();
        return null;
      }

      // Tìm giỏ hàng người dùng
      let userCart = await Cart.findOne({ user: userId, status: 'active' });

      if (!userCart) {
        // Nếu người dùng không có giỏ hàng, chuyển đổi giỏ hàng guest thành của người dùng
        guestCart.user = userId;
        guestCart.sessionId = null;
        guestCart.expiresAt = null;
        guestCart.updatedAt = new Date();
        guestCart.lastActivity = new Date();
        await guestCart.save({ session });

        await session.commitTransaction();
        return guestCart;
      }

      // Hợp nhất các sản phẩm từ giỏ hàng guest vào giỏ hàng người dùng
      const now = new Date();

      for (const guestItem of guestCart.items) {
        // Kiểm tra tồn kho
        const product = await Product.findById(guestItem.product);

        if (product) {
          const existingItemIndex = userCart.items.findIndex(
            (item) =>
              item.product.toString() === guestItem.product.toString() &&
              JSON.stringify(item.attributes || {}) === JSON.stringify(guestItem.attributes || {})
          );

          if (existingItemIndex > -1) {
            // Cộng số lượng nếu sản phẩm đã tồn tại
            const newQuantity = userCart.items[existingItemIndex].quantity + guestItem.quantity;

            if (product.stock >= newQuantity) {
              userCart.items[existingItemIndex].quantity = newQuantity;
              userCart.items[existingItemIndex].updatedAt = now;
            } else {
              // Nếu không đủ tồn kho, đặt số lượng tối đa có thể
              userCart.items[existingItemIndex].quantity = product.stock;
              userCart.items[existingItemIndex].updatedAt = now;
            }
          } else {
            // Thêm sản phẩm mới
            if (product.stock >= guestItem.quantity) {
              userCart.items.push({
                ...guestItem.toObject(),
                updatedAt: now,
              });
            } else if (product.stock > 0) {
              // Thêm với số lượng tối đa có thể
              userCart.items.push({
                ...guestItem.toObject(),
                quantity: product.stock,
                updatedAt: now,
              });
            }
          }
        }
      }

      // Cập nhật tổng tiền
      userCart.subtotal = userCart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Giữ lại coupon nếu có
      if (guestCart.coupon && !userCart.coupon) {
        userCart.coupon = guestCart.coupon;
      }

      // Cập nhật timestamps
      userCart.updatedAt = now;
      userCart.lastActivity = now;

      // Lưu giỏ hàng người dùng
      await userCart.save({ session });

      // Đánh dấu giỏ hàng guest đã được hợp nhất
      guestCart.status = 'merged';
      guestCart.updatedAt = now;
      await guestCart.save({ session });

      await session.commitTransaction();
      return userCart;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getCartDetails(cartId) {
    const cart = await Cart.findById(cartId).populate({
      path: 'items.product',
      select: 'name slug images stock price salePrice',
    });

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    // Kiểm tra tồn kho và cập nhật giá (nếu có thay đổi)
    let needsUpdate = false;

    for (const item of cart.items) {
      const product = item.product;

      // Cập nhật giá nếu có thay đổi
      const currentPrice = product.salePrice || product.price;
      if (item.price !== currentPrice) {
        item.price = currentPrice;
        needsUpdate = true;
      }

      // Kiểm tra tồn kho
      if (product.stock < item.quantity) {
        item.quantity = Math.max(0, product.stock);
        needsUpdate = true;
      }
    }

    // Lọc bỏ sản phẩm có số lượng 0
    cart.items = cart.items.filter((item) => item.quantity > 0);

    // Cập nhật tổng tiền
    const newSubtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cart.subtotal !== newSubtotal) {
      cart.subtotal = newSubtotal;
      needsUpdate = true;
    }

    // Lưu lại giỏ hàng nếu có thay đổi
    if (needsUpdate) {
      cart.updatedAt = new Date();
      cart.lastActivity = new Date();
      await cart.save();
    }

    return cart;
  }
}

module.exports = new CartRepository();
