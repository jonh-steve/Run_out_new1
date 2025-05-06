/**
 * Script để sửa lỗi chỉ mục trùng lặp trong MongoDB
 */
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
require('dotenv').config();

async function dropIndexes() {
  try {
    logger.info('Kết nối đến MongoDB để sửa lỗi chỉ mục...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Kết nối thành công!');

    // Lấy danh sách tất cả các collection trong database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    logger.info(`Tìm thấy ${collectionNames.length} collection: ${collectionNames.join(', ')}`);

    // Xử lý từng collection
    for (const collectionName of collectionNames) {
      // Bỏ qua các collection hệ thống
      if (collectionName.startsWith('system.')) {
        logger.info(`Bỏ qua collection hệ thống: ${collectionName}`);
        continue;
      }

      try {
        const collection = mongoose.connection.collection(collectionName);

        // Lấy danh sách tất cả chỉ mục
        const indexes = await collection.indexes();
        logger.info(`Collection ${collectionName}: Tìm thấy ${indexes.length} chỉ mục`);

        // Log tất cả các chỉ mục để tham khảo
        indexes.forEach((index) => {
          logger.info(
            `- Chỉ mục: ${index.name}, Key: ${JSON.stringify(index.key)}, Options: ${JSON.stringify(index)}`
          );
        });

        // Xóa tất cả các chỉ mục trừ _id
        const dropPromises = indexes
          .filter((index) => index.name !== '_id_') // Giữ lại chỉ mục _id
          .map((index) => {
            logger.info(`Đang xóa chỉ mục: ${index.name} trong collection ${collectionName}`);
            return collection
              .dropIndex(index.name)
              .then(() => logger.info(`Đã xóa thành công chỉ mục ${index.name}`))
              .catch((err) => logger.error(`Không thể xóa chỉ mục ${index.name}: ${err.message}`));
          });

        await Promise.all(dropPromises);
        logger.info(`Đã xóa tất cả chỉ mục trừ _id trong collection ${collectionName}`);
      } catch (collectionError) {
        logger.error(`Lỗi khi xử lý collection ${collectionName}: ${collectionError.message}`);
      }
    }

    logger.info('Hoàn tất xóa chỉ mục. Hãy khởi động lại ứng dụng để tạo lại chỉ mục hợp lệ.');
    await mongoose.disconnect();
    logger.info('Đã ngắt kết nối MongoDB');
  } catch (error) {
    logger.error(`Lỗi khi xóa chỉ mục: ${error.message}`);
    throw error;
  }
}

// Chạy script
dropIndexes();
