const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('./config');

/**
 * Lớp quản lý và chạy migrations
 */
class MigrationRunner {
  constructor() {
    this.db = mongoose.connection;
    this.migrationCollection = this.db.collection(config.migrationCollection);
    this.logger = config.logger;
  }

  /**
   * Lấy danh sách các migrations đã chạy
   * @returns {Promise<Array>} Danh sách migrations đã chạy
   */
  async getCompletedMigrations() {
    try {
      // Nếu collection không tồn tại, tạo mới
      const collections = await this.db.db
        .listCollections({ name: config.migrationCollection })
        .toArray();

      if (collections.length === 0) {
        await this.db.createCollection(config.migrationCollection);
        return [];
      }

      // Lấy danh sách migrations đã chạy
      const completedMigrations = await this.migrationCollection
        .find({})
        .sort({ timestamp: 1 })
        .toArray();
      return completedMigrations.map((migration) => migration.name);
    } catch (error) {
      this.logger.error('Error getting completed migrations:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu một migration đã chạy thành công
   * @param {String} name - Tên migration
   * @returns {Promise<void>}
   */
  async markMigrationAsCompleted(name) {
    try {
      await this.migrationCollection.insertOne({
        name,
        timestamp: new Date(),
        environment: config.environment,
      });

      this.logger.info(`Migration ${name} marked as completed`);
    } catch (error) {
      this.logger.error(`Error marking migration ${name} as completed:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả các migration scripts
   * @returns {Promise<Array>} Danh sách tên các migration scripts
   */
  async getAllMigrationScripts() {
    try {
      const scriptsDir = path.resolve(__dirname, config.scriptsDir);
      const files = fs.readdirSync(scriptsDir);

      // Lọc chỉ lấy các file JavaScript
      return files.filter((file) => file.endsWith('.js')).sort(); // Sắp xếp theo thứ tự tên file
    } catch (error) {
      this.logger.error('Error getting migration scripts:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách các migrations cần chạy
   * @returns {Promise<Array>} Danh sách tên các migrations cần chạy
   */
  async getPendingMigrations() {
    const completedMigrations = await this.getCompletedMigrations();
    const allMigrations = await this.getAllMigrationScripts();

    // Lọc các migrations chưa chạy
    return allMigrations.filter((migration) => !completedMigrations.includes(migration));
  }

  /**
   * Chạy một migration script
   * @param {String} scriptName - Tên file script
   * @returns {Promise<void>}
   */
  async runMigration(scriptName) {
    try {
      this.logger.info(`Running migration: ${scriptName}`);

      // Import migration script
      const scriptPath = path.resolve(__dirname, config.scriptsDir, scriptName);
      const migration = require(scriptPath);

      // Chạy migration
      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${scriptName} does not have an 'up' function`);
      }

      await migration.up(this.db);

      // Đánh dấu migration đã hoàn thành
      await this.markMigrationAsCompleted(scriptName);

      this.logger.info(`Migration ${scriptName} completed successfully`);
    } catch (error) {
      this.logger.error(`Error running migration ${scriptName}:`, error);
      throw error;
    }
  }

  /**
   * Rollback một migration
   * @param {String} scriptName - Tên file script
   * @returns {Promise<void>}
   */
  async rollbackMigration(scriptName) {
    try {
      this.logger.info(`Rolling back migration: ${scriptName}`);

      // Import migration script
      const scriptPath = path.resolve(__dirname, config.scriptsDir, scriptName);
      const migration = require(scriptPath);

      // Chạy rollback
      if (typeof migration.down !== 'function') {
        throw new Error(`Migration ${scriptName} does not have a 'down' function`);
      }

      await migration.down(this.db);

      // Xóa migration khỏi danh sách đã hoàn thành
      await this.migrationCollection.deleteOne({ name: scriptName });

      this.logger.info(`Migration ${scriptName} rolled back successfully`);
    } catch (error) {
      this.logger.error(`Error rolling back migration ${scriptName}:`, error);
      throw error;
    }
  }

  /**
   * Chạy tất cả các migrations chưa hoàn thành
   * @returns {Promise<void>}
   */
  async migrate() {
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      this.logger.info('No pending migrations to run');
      return;
    }

    this.logger.info(`Found ${pendingMigrations.length} pending migrations`);

    // Chạy từng migration theo thứ tự
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }

    this.logger.info('All migrations completed successfully');
  }

  /**
   * Rollback migration cuối cùng đã chạy
   * @returns {Promise<void>}
   */
  async rollback() {
    const completedMigrations = await this.getCompletedMigrations();

    if (completedMigrations.length === 0) {
      this.logger.info('No migrations to roll back');
      return;
    }

    // Lấy migration cuối cùng
    const lastMigration = completedMigrations[completedMigrations.length - 1];

    await this.rollbackMigration(lastMigration);
  }
}

module.exports = new MigrationRunner();
