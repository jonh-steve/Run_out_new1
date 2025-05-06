// server/src/seeds/runner.js
const User = require('../data/models/user.model');
const Category = require('../data/models/category.model');
const Product = require('../data/models/product.model');
const Order = require('../data/models/order.model');
const Review = require('../data/models/review.model');

const users = require('./data/users');
const categories = require('./data/categories');
const products = require('./data/products');
const orders = require('./data/orders');
const reviews = require('./data/reviews');

class SeedRunner {
  async run(environment = 'development') {
    try {
      console.log(`Seeding database for ${environment} environment...`);

      // Xóa dữ liệu cũ (chỉ trong môi trường development và testing)
      if (['development', 'testing'].includes(environment)) {
        await this.clearDatabase();
      }

      // Seed các collections
      const createdUsers = await this.seedUsers();
      const createdCategories = await this.seedCategories();

      // Seed products với references đến categories
      const productData = this.prepareProducts(createdCategories);
      const createdProducts = await this.seedProducts(productData);

      // Seed orders và reviews với references đến users và products
      await this.seedOrders(createdUsers, createdProducts);
      await this.seedReviews(createdUsers, createdProducts);

      console.log('Seeding completed successfully.');
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    }
  }

  async clearDatabase() {
    console.log('Clearing database...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
  }

  async seedUsers() {
    console.log('Seeding users...');
    return await User.insertMany(users);
  }

  async seedCategories() {
    console.log('Seeding categories...');
    return await Category.insertMany(categories);
  }

  prepareProducts(createdCategories) {
    console.log('Preparing product data with category references...');
    // Gán category ID thực tế cho mỗi sản phẩm
    return products.map((product) => {
      // Tìm category tương ứng dựa trên tên hoặc slug
      const category = createdCategories.find(
        (cat) => cat.name === product.categoryName || cat.slug === product.categorySlug
      );

      // Nếu tìm thấy category, gán ID của category đó cho sản phẩm
      if (category) {
        return {
          ...product,
          category: category._id,
          // Xóa các trường tạm không cần thiết
          categoryName: undefined,
          categorySlug: undefined,
        };
      }

      return product;
    });
  }

  async seedProducts(productData) {
    console.log('Seeding products...');
    return await Product.insertMany(productData);
  }

  async seedOrders(createdUsers, createdProducts) {
    console.log('Seeding orders...');

    // Chuẩn bị dữ liệu đơn hàng với references đến users và products
    const preparedOrders = orders
      .map((order) => {
        // Tìm user tương ứng
        const user = createdUsers.find((u) => u.email === order.userEmail);

        // Chuẩn bị các item trong đơn hàng
        const items = order.items
          .map((item) => {
            // Tìm product tương ứng
            const product = createdProducts.find((p) => p.sku === item.productSku);

            return {
              product: product ? product._id : null,
              quantity: item.quantity,
              price: item.price,
            };
          })
          .filter((item) => item.product !== null);

        return {
          user: user ? user._id : null,
          items: items,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt || new Date(),
        };
      })
      .filter((order) => order.user !== null && order.items.length > 0);

    return await Order.insertMany(preparedOrders);
  }

  async seedReviews(createdUsers, createdProducts) {
    console.log('Seeding reviews...');

    // Chuẩn bị dữ liệu đánh giá với references đến users và products
    const preparedReviews = reviews
      .map((review) => {
        // Tìm user và product tương ứng
        const user = createdUsers.find((u) => u.email === review.userEmail);
        const product = createdProducts.find((p) => p.sku === review.productSku);

        if (user && product) {
          return {
            user: user._id,
            product: product._id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt || new Date(),
          };
        }
        return null;
      })
      .filter((review) => review !== null);

    return await Review.insertMany(preparedReviews);
  }
}

module.exports = new SeedRunner();
