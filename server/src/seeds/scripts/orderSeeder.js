// server/src/data/seeds/orderSeeds.js
// const mongoose = require('mongoose');
const Order = require('../data/orders');
const User = require('../data/users');
const Product = require('../data/products');
const logger = require('../../config/logger');

const seedOrders = async () => {
  try {
    // Kiểm tra xem đã có orders trong DB chưa
    const count = await Order.countDocuments();
    if (count > 0) {
      logger.info('Orders collection already seeded');
      return;
    }

    // Lấy một số users và products để tạo orders
    const users = await User.find().limit(5);
    const products = await Product.find().limit(10);

    if (users.length === 0 || products.length === 0) {
      logger.warn('Cannot seed orders: No users or products found');
      return;
    }

    const orders = [];

    // Tạo một số orders mẫu
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Tạo 1-3 orders cho mỗi user
      const orderCount = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < orderCount; j++) {
        // Tạo items cho order
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;

        for (let k = 0; k < itemCount; k++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const price = product.price;
          const totalPrice = price * quantity;

          items.push({
            product: product._id,
            name: product.name,
            price,
            quantity,
            totalPrice,
            attributes: {},
            sku: `SKU-${product._id.toString().substr(-6)}`,
            image: product.images && product.images.length > 0 ? product.images[0].url : '',
          });

          subtotal += totalPrice;
        }

        const shippingCost = 30000;
        const totalAmount = subtotal + shippingCost;

        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

        orders.push({
          orderNumber: `RO-${2025}-${String(i * 3 + j + 1).padStart(4, '0')}`,
          user: user._id,
          customerInfo: {
            name: user.name,
            email: user.email,
            phone: user.phone || '0901234567',
          },
          items,
          subtotal,
          shippingCost,
          tax: 0,
          totalAmount,
          shippingAddress: {
            name: user.name,
            phone: user.phone || '0901234567',
            street: user.address?.street || '123 Nguyễn Huệ',
            city: user.address?.city || 'Hồ Chí Minh',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || '70000',
            country: user.address?.country || 'Việt Nam',
          },
          shippingMethod: 'standard',
          paymentMethod: 'cod',
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          status,
          statusHistory: [
            {
              status: 'pending',
              date: createdAt,
              note: 'Đơn hàng đã được tạo',
            },
            ...(status !== 'pending'
              ? [
                  {
                    status: 'processing',
                    date: new Date(createdAt.getTime() + 86400000),
                    note: 'Đơn hàng đang được xử lý',
                  },
                ]
              : []),
            ...(status === 'shipped' || status === 'delivered'
              ? [
                  {
                    status: 'shipped',
                    date: new Date(createdAt.getTime() + 86400000 * 2),
                    note: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
                  },
                ]
              : []),
            ...(status === 'delivered'
              ? [
                  {
                    status: 'delivered',
                    date: new Date(createdAt.getTime() + 86400000 * 4),
                    note: 'Đơn hàng đã được giao thành công',
                  },
                ]
              : []),
          ],
          createdAt,
          updatedAt: createdAt,
          ...(status === 'delivered'
            ? { completedAt: new Date(createdAt.getTime() + 86400000 * 4) }
            : {}),
        });
      }
    }

    // Lưu vào database
    await Order.insertMany(orders);
    logger.info(`Seeded ${orders.length} orders`);
  } catch (error) {
    logger.error('Error seeding orders', error);
    throw error;
  }
};

module.exports = { seedOrders };
