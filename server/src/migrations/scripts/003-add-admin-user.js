const bcrypt = require('bcrypt');

/**
 * Migration: Tạo user admin mặc định
 */
module.exports = {
  /**
   * Chạy migration
   * @param {Object} db - MongoDB connection
   */
  up: async (db) => {
    const users = db.collection('users');

    // Kiểm tra xem đã có admin chưa
    const adminExists = await users.findOne({ role: 'admin' });

    if (!adminExists) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      // Tạo admin user
      await users.insertOne({
        name: 'Admin',
        email: 'admin@runout-biliard.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Rollback migration
   * @param {Object} db - MongoDB connection
   */
  down: async (db) => {
    const users = db.collection('users');

    // Xóa admin user
    await users.deleteOne({ email: 'admin@runout-biliard.com' });
  },
};
