const mongoose = require('mongoose');
const logger = require('./logger');
const { setupIndexes } = require('./indexes');
// Tùy chọn kết nối Mongoose
const options = {
  autoIndex: process.env.NODE_ENV !== 'production', // Tự động tạo index trong môi trường dev
  serverSelectionTimeoutMS: 5000, // Timeout cho việc lựa chọn server
  socketTimeoutMS: 45000, // Đóng socket sau 45 giây không hoạt động
  family: 4, // Sử dụng IPv4, bỏ qua IPv6
};

// Kết nối đến MongoDB
const connectToDatabase = async () => {
  try {
    // Xác định URI dựa vào môi trường
    const uri =
      process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;

    await mongoose.connect(uri, options);

    logger.info('Kết nối thành công đến MongoDB');
    setupIndexes();
    // Xử lý sự kiện khi kết nối bị ngắt
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mất kết nối MongoDB, đang thử kết nối lại...');
      setTimeout(connectToDatabase, 5000);
    });

    // Xử lý sự kiện khi có lỗi
    mongoose.connection.on('error', (err) => {
      logger.error(`Lỗi kết nối MongoDB: ${err.message}`);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error(`Không thể kết nối đến MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Ngắt kết nối từ MongoDB
const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Đã ngắt kết nối từ MongoDB');
  } catch (error) {
    logger.error(`Lỗi khi ngắt kết nối từ MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
};
