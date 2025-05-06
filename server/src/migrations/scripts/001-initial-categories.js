/**
 * Migration: Tạo các danh mục sản phẩm ban đầu
 */
module.exports = {
  /**
   * Chạy migration
   * @param {Object} db - MongoDB connection
   */
  up: async (db) => {
    // Tạo collection categories nếu chưa tồn tại
    const collections = await db.db.listCollections({ name: 'categories' }).toArray();
    if (collections.length === 0) {
      await db.db.createCollection('categories');
    }

    const categories = db.collection('categories');

    // Danh sách các danh mục cơ bản
    const initialCategories = [
      {
        name: 'Gậy Billiard',
        slug: 'gay-billiard',
        description: 'Tất cả các loại gậy billiard chất lượng cao',
        parent: null,
        level: 0,
        order: 1,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bi Billiard',
        slug: 'bi-billiard',
        description: 'Các bộ bi billiard tiêu chuẩn quốc tế',
        parent: null,
        level: 0,
        order: 2,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Phụ Kiện',
        slug: 'phu-kien',
        description: 'Phụ kiện billiard chất lượng cao',
        parent: null,
        level: 0,
        order: 3,
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Chèn các danh mục vào database
    await categories.insertMany(initialCategories);
  },

  /**
   * Rollback migration
   * @param {Object} db - MongoDB connection
   */
  down: async (db) => {
    const categories = db.collection('categories');

    // Xóa các danh mục đã tạo
    await categories.deleteMany({
      slug: { $in: ['gay-billiard', 'bi-billiard', 'phu-kien'] },
    });
  },
};
