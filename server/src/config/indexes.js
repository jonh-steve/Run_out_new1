/**
 * Cấu hình thiết lập chỉ mục cho MongoDB
 */
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * Kiểm tra xem chỉ mục có tồn tại chưa
 * @param {Object} collection - Collection MongoDB
 * @param {Object} indexSpec - Chỉ mục cần kiểm tra
 * @returns {Promise<boolean>} - true nếu chỉ mục đã tồn tại
 */
async function indexExists(collection, indexSpec) {
  try {
    const indexes = await collection.indexes();

    // So sánh cấu trúc chỉ mục (chỉ dựa trên các trường)
    const keyString = JSON.stringify(Object.keys(indexSpec).sort());

    for (const index of indexes) {
      const existingKeyString = JSON.stringify(Object.keys(index.key).sort());
      if (existingKeyString === keyString) {
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error(`Lỗi khi kiểm tra chỉ mục: ${error.message}`);
    return false;
  }
}

/**
 * Thiết lập chỉ mục cho các collection
 */
async function setupIndexes() {
  try {
    logger.info('Thiết lập chỉ mục cơ sở dữ liệu...');

    // Chỉ mục đặc biệt cho Product (text search)
    try {
      const Product = mongoose.model('Product');
      const productCollection = Product.collection;

      const textIndexSpec = {
        name: 'text',
        'description.short': 'text',
        'description.long': 'text',
        brand: 'text',
      };

      // Kiểm tra xem chỉ mục text đã tồn tại chưa
      const productIndexes = await productCollection.indexes();
      const hasTextIndex = productIndexes.some((idx) => idx.textIndexVersion);

      if (!hasTextIndex) {
        logger.info('Tạo chỉ mục text cho collection Product');
        await Product.collection.createIndex(textIndexSpec, {
          weights: {
            name: 10,
            'description.short': 5,
            'description.long': 3,
            brand: 3,
          },
          name: 'product_text_search',
        });
      } else {
        logger.info('Chỉ mục text cho collection Product đã tồn tại, bỏ qua tạo mới');
      }
    } catch (productError) {
      logger.error(`Không thể thiết lập chỉ mục text cho Product: ${productError.message}`);
    }

    // KHÔNG TẠO THÊM CHỈ MỤC TẠI ĐÂY
    // Để các model tự tạo chỉ mục của mình khi khởi động

    logger.info('Hoàn tất thiết lập chỉ mục');
    return true;
  } catch (error) {
    logger.error(`Lỗi khi thiết lập chỉ mục: ${error.message}`);
    throw error;
  }
}

module.exports = { setupIndexes };
