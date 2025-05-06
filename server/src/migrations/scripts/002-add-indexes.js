/**
 * Migration: Tạo các indexes cho database
 */
module.exports = {
  /**
   * Chạy migration
   * @param {Object} db - MongoDB connection
   */
  up: async (db) => {
    // Index cho User collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    // Index cho Product collection
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ price: 1 });

    // Text index cho tìm kiếm sản phẩm
    await db.collection('products').createIndex(
      { name: 'text', description: 'text' },
      {
        weights: {
          name: 10,
          description: 5,
        },
        default_language: 'none',
      }
    );

    // Index cho Category collection
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ parent: 1 });

    // Index cho Order collection
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ user: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });

    // Index cho Cart collection
    await db.collection('carts').createIndex({ user: 1 }, { sparse: true });
    await db.collection('carts').createIndex({ sessionId: 1 }, { sparse: true });

    // TTL index cho cart expiration
    await db.collection('carts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Index cho Review collection
    await db.collection('reviews').createIndex({ product: 1 });
    await db.collection('reviews').createIndex({ user: 1 });
    await db.collection('reviews').createIndex({ product: 1, createdAt: -1 });
  },

  /**
   * Rollback migration
   * @param {Object} db - MongoDB connection
   */
  down: async (db) => {
    // Drop indexes từ User collection
    await db.collection('users').dropIndex({ email: 1 });
    await db.collection('users').dropIndex({ role: 1 });

    // Drop indexes từ Product collection
    await db.collection('products').dropIndex({ slug: 1 });
    await db.collection('products').dropIndex({ category: 1 });
    await db.collection('products').dropIndex({ createdAt: -1 });
    await db.collection('products').dropIndex({ price: 1 });
    await db.collection('products').dropIndex('name_text_description_text');

    // Drop indexes từ Category collection
    await db.collection('categories').dropIndex({ slug: 1 });
    await db.collection('categories').dropIndex({ parent: 1 });

    // Drop indexes từ Order collection
    await db.collection('orders').dropIndex({ orderNumber: 1 });
    await db.collection('orders').dropIndex({ user: 1 });
    await db.collection('orders').dropIndex({ status: 1 });
    await db.collection('orders').dropIndex({ createdAt: -1 });

    // Drop indexes từ Cart collection
    await db.collection('carts').dropIndex({ user: 1 });
    await db.collection('carts').dropIndex({ sessionId: 1 });
    await db.collection('carts').dropIndex({ expiresAt: 1 });

    // Drop indexes từ Review collection
    await db.collection('reviews').dropIndex({ product: 1 });
    await db.collection('reviews').dropIndex({ user: 1 });
    await db.collection('reviews').dropIndex({ product: 1, createdAt: -1 });
  },
};
