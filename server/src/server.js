/**
 * Server chính cho ứng dụng RunOut-Biliard
 * @author Steve
 * @project RunOut-Biliard
 */

const http = require('http');
const app = require('./app');
const config = require('./config/environment');
const logger = require('./config/logger');

// Lấy PORT từ cấu hình hoặc biến môi trường
const PORT = process.env.PORT || config.app.port || 5000;

// Tạo HTTP server
const server = http.createServer(app);

// Xử lý các lỗi server
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Xử lý các lỗi server cụ thể với thông báo thân thiện
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} yêu cầu quyền nâng cao`);
      throw new Error(`${bind} yêu cầu quyền nâng cao`);
    case 'EADDRINUSE':
      logger.error(`${bind} đã được sử dụng`);
      throw new Error(`${bind} đã được sử dụng`);
    default:
      throw error;
  }
});

// Khởi động server
server.listen(PORT, () => {
  logger.info(`🚀 Server đang chạy trong môi trường ${config.app.environment}`);
  logger.info(`🌐 Địa chỉ: http://${config.app.host}:${PORT}`);
});

// Xử lý tắt server an toàn
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Đóng server một cách an toàn
 */
function gracefulShutdown() {
  logger.info('Nhận tín hiệu tắt server, đang đóng kết nối...');

  server.close(() => {
    logger.info('Server đã đóng, đang ngắt kết nối cơ sở dữ liệu...');

    // Đóng kết nối cơ sở dữ liệu nếu cần
    try {
      if (require('mongoose').connection.readyState) {
        require('mongoose').connection.close(false, () => {
          logger.info('Đã ngắt kết nối MongoDB.');
          throw new Error('Server đã đóng và ngắt kết nối thành công');
        });
      } else {
        throw new Error('Server đã đóng và không cần ngắt kết nối');
      }
    } catch (err) {
      logger.error(`Lỗi khi đóng kết nối: ${err.message}`);
      throw new Error(`Lỗi khi đóng kết nối: ${err.message}`);
    }
  });

  // Nếu server không đóng sau 10s, tắt cưỡng chế
  setTimeout(() => {
    logger.error('Không thể đóng kết nối một cách êm dịu, đang tắt cưỡng chế...');
    throw new Error('Không thể đóng kết nối một cách êm dịu, đang tắt cưỡng chế...');
  }, 10000);
}

// Xử lý các lỗi không bắt được khác
process.on('uncaughtException', (error) => {
  logger.error(`Lỗi không bắt được: ${error.message}`);
  logger.error(error.stack);

  // Trong môi trường sản xuất, đảm bảo server đóng an toàn sau lỗi không bắt được
  if (config.app.environment === 'production') {
    gracefulShutdown();
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Lời hứa bị từ chối không được xử lý:');
  logger.error(`Promise: ${promise}, Reason: ${reason}`);

  // Trong môi trường sản xuất, có thể xem xét tắt ứng dụng
  if (config.app.environment === 'production') {
    gracefulShutdown();
  }
});

module.exports = server; // Export để sử dụng trong kiểm thử
