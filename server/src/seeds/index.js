// server/src/data/seeds/index.js
const { seedUsers } = require('./scripts/userSeeder');
const { seedCategories } = require('./scripts/categorySeeder');
const { seedProducts } = require('./scripts/productSeeder');
const { seedOrders } = require('./scripts/orderSeeder');
const { seedReviews } = require('./scripts/reviewSeeder');
const { seedCarts } = require('./scripts/cartSeeder');
const logger = require('../config/logger');

const runSeeds = async () => {
  try {
    logger.info('Starting database seeding...');

    // Thứ tự chạy seed quan trọng do các dependencies
    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedOrders();
    await seedReviews();
    await seedCarts();

    logger.info('All database seeding completed successfully');
  } catch (error) {
    logger.error('Error running seeds', error);
    throw error;
  }
};

module.exports = { runSeeds };
