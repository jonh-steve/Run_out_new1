// server/src/data/seeds/cartSeeds.js
const Cart = require('../data/carts');
const User = require('../data/users');
const Product = require('../data/products');
const logger = require('../../config/logger');

const seedCarts = async () => {
  try {
    // Kiểm tra xem đã có carts trong DB chưa
    const count = await Cart.countDocuments();
    if (count > 0) {
      logger.info('Carts collection already seeded');
      return;
    }

    // Lấy một số users và products để tạo carts
    const users = await User.find().limit(5);
    const products = await Product.find().limit(10);

    if (users.length === 0 || products.length === 0) {
      logger.warn('Cannot seed carts: No users or products found');
      return;
    }

    const carts = [];

    // Tạo một giỏ hàng cho mỗi user
    for (const user of users) {
      // Tạo 1-4 items cho mỗi giỏ hàng
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;

      for (let i = 0; i < itemCount; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;

        items.push({
          product: product._id,
          quantity,
          price,
          attributes: {},
          addedAt: new Date(),
          updatedAt: new Date(),
        });

        subtotal += price * quantity;
      }

      const now = new Date();

      carts.push({
        user: user._id,
        items,
        subtotal,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastActivity: now,
      });
    }

    // Tạo một số giỏ hàng cho khách vãng lai
    for (let i = 0; i < 3; i++) {
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = product.price;

        items.push({
          product: product._id,
          quantity,
          price,
          attributes: {},
          addedAt: new Date(),
          updatedAt: new Date(),
        });

        subtotal += price * quantity;
      }

      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + 7); // 7 ngày hết hạn

      carts.push({
        sessionId: `sess_guest_${i}_${Date.now()}`,
        items,
        subtotal,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastActivity: now,
        expiresAt: expiryDate,
      });
    }

    // Lưu vào database
    await Cart.insertMany(carts);
    logger.info(`Seeded ${carts.length} carts`);
  } catch (error) {
    logger.error('Error seeding carts', error);
    throw error;
  }
};

module.exports = { seedCarts };
