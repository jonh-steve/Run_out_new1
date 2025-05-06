// server/src/data/seeds/reviewSeeds.js
const Review = require('../data/reviews');
const User = require('../data/users');
const Product = require('../data/products');
const Order = require('../data/orders');
const logger = require('../../config/logger');

const seedReviews = async () => {
  try {
    // Kiểm tra xem đã có reviews trong DB chưa
    const count = await Review.countDocuments();
    if (count > 0) {
      logger.info('Reviews collection already seeded');
      return;
    }

    // Lấy users, products và orders để tạo reviews
    const users = await User.find().limit(10);
    const products = await Product.find().limit(20);
    const orders = await Order.find({ status: 'delivered' });

    if (users.length === 0 || products.length === 0) {
      logger.warn('Cannot seed reviews: No users or products found');
      return;
    }

    const reviews = [];
    const reviewTitles = [
      'Sản phẩm tuyệt vời',
      'Rất hài lòng với sản phẩm',
      'Chất lượng tốt',
      'Đáng đồng tiền',
      'Sẽ mua lại',
      'Khá ổn',
      'Bình thường',
    ];

    const reviewContents = [
      'Sản phẩm đúng như mô tả, giao hàng nhanh, đóng gói cẩn thận.',
      'Chất lượng sản phẩm rất tốt, đúng như mong đợi. Sẽ tiếp tục ủng hộ shop.',
      'Sản phẩm đẹp, chất lượng tốt, giao hàng nhanh, đóng gói cẩn thận, shop tư vấn nhiệt tình.',
      'Sản phẩm đúng như hình, chất lượng tốt, sẽ ủng hộ shop dài dài.',
      'Mình rất thích sản phẩm này, chất lượng tuyệt vời, giá cả hợp lý.',
      'Khá ổn với mức giá này, có thể cải thiện thêm về phần đóng gói.',
      'Sản phẩm tạm được, không xuất sắc nhưng cũng không tệ.',
    ];

    // Tạo reviews từ các đơn hàng đã giao
    for (const order of orders) {
      for (const item of order.items) {
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 sao
        const reviewTitle = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];
        const reviewContent = reviewContents[Math.floor(Math.random() * reviewContents.length)];

        const createdAt = new Date(order.completedAt);
        createdAt.setDate(createdAt.getDate() + Math.floor(Math.random() * 7)); // 0-7 ngày sau khi đơn hàng hoàn thành

        reviews.push({
          product: item.product,
          user: order.user,
          order: order._id,
          rating,
          title: reviewTitle,
          review: reviewContent,
          isVerifiedPurchase: true,
          purchaseDate: order.createdAt,
          helpfulness: {
            upvotes: Math.floor(Math.random() * 10),
            downvotes: Math.floor(Math.random() * 3),
            voters: [],
          },
          moderation: {
            status: 'approved',
            moderatedAt: new Date(),
          },
          isVisible: true,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Tạo thêm một số reviews ngẫu nhiên
    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 sao
      const reviewTitle =
        rating >= 3
          ? reviewTitles[Math.floor(Math.random() * reviewTitles.length)]
          : 'Không như mong đợi';
      const reviewContent =
        rating >= 3
          ? reviewContents[Math.floor(Math.random() * reviewContents.length)]
          : 'Sản phẩm không đúng như mô tả, chất lượng kém.';

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      reviews.push({
        product: product._id,
        user: user._id,
        rating,
        title: reviewTitle,
        review: reviewContent,
        isVerifiedPurchase: false,
        helpfulness: {
          upvotes: Math.floor(Math.random() * 5),
          downvotes: Math.floor(Math.random() * 2),
          voters: [],
        },
        moderation: {
          status: 'approved',
          moderatedAt: new Date(),
        },
        isVisible: true,
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Lưu vào database
    await Review.insertMany(reviews);
    logger.info(`Seeded ${reviews.length} reviews`);

    // Cập nhật ratings cho products
    for (const product of products) {
      const productReviews = reviews.filter(
        (review) => review.product.toString() === product._id.toString()
      );

      if (productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / productReviews.length;

        await Product.findByIdAndUpdate(product._id, {
          'ratings.average': parseFloat(averageRating.toFixed(1)),
          'ratings.count': productReviews.length,
        });
      }
    }

    logger.info('Updated product ratings');
  } catch (error) {
    logger.error('Error seeding reviews', error);
    throw error;
  }
};

module.exports = { seedReviews };
