const migrationRunner = require('./migrationRunner');
const mongoose = require('mongoose');
const config = require('../config/environment');

/**
 * Lớp lỗi tùy chỉnh cho migrations
 */
class MigrationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'MigrationError';
    this.originalError = originalError;
  }
}

/**
 * Đóng kết nối database
 */
const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    console.log('Closing database connection...');
    await mongoose.connection.close();
  }
};

/**
 * Chạy migrations
 */
const runMigrations = async () => {
  try {
    // Kết nối database nếu chưa kết nối
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to database...');
      await mongoose.connect(config.database.uri, config.database.options);
    }

    console.log('Running migrations...');
    await migrationRunner.migrate();

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw new MigrationError('Failed to run migrations', error);
  }
};

/**
 * Rollback migration gần nhất
 */
const rollbackMigration = async () => {
  try {
    // Kết nối database nếu chưa kết nối
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to database...');
      await mongoose.connect(config.database.uri, config.database.options);
    }

    console.log('Rolling back last migration...');
    await migrationRunner.rollback();

    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Error rolling back migration:', error);
    throw new MigrationError('Failed to rollback migration', error);
  }
};

// Xử lý arguments từ command line
const processArguments = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'migrate':
        await runMigrations();
        break;
      case 'rollback':
        await rollbackMigration();
        break;
      default:
        console.log('Usage: node migrations [migrate|rollback]');
        return; // Thoát hàm mà không ném lỗi vì đây không phải lỗi thực sự
    }
  } catch (error) {
    // Xử lý lỗi ở cấp cao nhất
    console.error(`Migration command '${command}' failed:`, error);
    // Đặt mã thoát là 1 để chỉ ra lỗi
    process.exitCode = 1;
  } finally {
    // Đảm bảo đóng kết nối database trong mọi trường hợp
    await closeConnection();
  }
};

// Chỉ chạy nếu được gọi trực tiếp (không phải require)
if (require.main === module) {
  processArguments().catch((error) => {
    console.error('Unhandled error in migrations:', error);
    process.exitCode = 1;
  });
} else {
  // Export functions để có thể gọi từ module khác
  module.exports = {
    runMigrations,
    rollbackMigration,
    closeConnection, // Export thêm hàm đóng kết nối để module khác có thể sử dụng
  };
}
