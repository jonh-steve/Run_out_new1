/**
 * Cấu hình cho hệ thống migration
 */
const config = {
  // Collection để lưu trạng thái các migrations đã chạy
  migrationCollection: 'migrations',

  // Thư mục chứa các migration scripts
  scriptsDir: './scripts',

  // Môi trường chạy migrations
  environment: process.env.NODE_ENV || 'development',

  // Có bắt buộc migrations phải chạy theo thứ tự không
  requireSequential: true,

  // Logger cho migrations
  logger: console,
};

module.exports = config;
