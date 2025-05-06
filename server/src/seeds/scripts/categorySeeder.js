/**
 * Category Seeder
 * 
 * File này tạo dữ liệu mẫu cho các danh mục sản phẩm trong cửa hàng billiard
 * Bao gồm cả danh mục chính và danh mục con
 * File categorySeeder.js này thực hiện các chức năng sau:

Định nghĩa dữ liệu mẫu cho các danh mục chính và danh mục con
Tạo slugs tự động cho các danh mục dựa trên tên
Thiết lập mối quan hệ phân cấp giữa danh mục chính và danh mục con
Kiểm tra xem danh mục đã tồn tại trước khi seed để tránh trùng lặp
Ghi log quá trình seed để dễ dàng debug
 */
// const mongoose = require('mongoose');
const Category = require('../../data/models/category.model');
const { slugify } = require('../../common/utils/formatters');
const logger = require('../../config/logger');

/**
 * Dữ liệu mẫu cho danh mục chính
 */
const mainCategories = [
  {
    name: 'Gậy Billiard',
    description:
      'Tất cả các loại gậy billiard chất lượng cao từ các thương hiệu uy tín trong và ngoài nước',
    image: {
      url: '/images/categories/gay-billiard.jpg',
      alt: 'Gậy Billiard',
    },
    icon: 'cue-stick-icon',
    color: '#3498db',
    order: 1,
    isActive: true,
    isVisible: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Gậy Billiard Chất Lượng Cao | RunOut-Biliard',
      metaDescription:
        'Khám phá bộ sưu tập gậy billiard chất lượng cao cho người chơi ở mọi trình độ tại RunOut-Biliard',
      keywords: ['gậy billiard', 'gậy bida', 'cơ bida', 'gậy chơi bida'],
    },
    filters: [
      {
        name: 'Chất liệu',
        type: 'select',
        options: ['Gỗ sồi', 'Gỗ thích', 'Gỗ maple', 'Composit'],
      },
      {
        name: 'Trọng lượng',
        type: 'range',
        min: 400,
        max: 700,
        unit: 'g',
      },
    ],
  },
  {
    name: 'Bi Billiard',
    description: 'Các bộ bi billiard tiêu chuẩn quốc tế, phù hợp cho mọi loại hình chơi',
    image: {
      url: '/images/categories/bi-billiard.jpg',
      alt: 'Bi Billiard',
    },
    icon: 'billiard-ball-icon',
    color: '#e74c3c',
    order: 2,
    isActive: true,
    isVisible: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Bi Billiard Chính Hãng | RunOut-Biliard',
      metaDescription:
        'Bộ sưu tập bi billiard chất lượng cao, đạt tiêu chuẩn quốc tế cho các giải đấu chuyên nghiệp',
      keywords: ['bi billiard', 'bi bida', 'bộ bi bida', 'bi lỗ', 'bi carom'],
    },
  },
  {
    name: 'Phụ Kiện',
    description: 'Các phụ kiện billiard chất lượng cao, từ phấn, găng tay đến túi đựng gậy',
    image: {
      url: '/images/categories/phu-kien.jpg',
      alt: 'Phụ Kiện Billiard',
    },
    icon: 'billiard-accessories-icon',
    color: '#2ecc71',
    order: 3,
    isActive: true,
    isVisible: true,
    isFeatured: false,
    seo: {
      metaTitle: 'Phụ Kiện Billiard | RunOut-Biliard',
      metaDescription:
        'Đa dạng phụ kiện billiard chất lượng cao giúp nâng cao trải nghiệm chơi bida của bạn',
      keywords: ['phụ kiện billiard', 'phấn bida', 'găng tay bida', 'túi đựng gậy'],
    },
  },
  {
    name: 'Bàn Billiard',
    description: 'Các loại bàn billiard cao cấp cho gia đình và kinh doanh',
    image: {
      url: '/images/categories/ban-billiard.jpg',
      alt: 'Bàn Billiard',
    },
    icon: 'billiard-table-icon',
    color: '#9b59b6',
    order: 4,
    isActive: true,
    isVisible: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Bàn Billiard Chất Lượng Cao | RunOut-Biliard',
      metaDescription:
        'Bàn billiard chất lượng cao, đa dạng kích thước và thiết kế cho gia đình và kinh doanh',
      keywords: ['bàn billiard', 'bàn bida', 'bàn bi-a', 'bàn pool', 'bàn carom'],
    },
  },
];

/**
 * Dữ liệu mẫu cho danh mục con
 * Mỗi item trong mảng đại diện cho một danh mục con của một danh mục chính
 * parentName: tên của danh mục cha
 */
const subCategories = [
  // Danh mục con của "Gậy Billiard"
  {
    name: 'Gậy Billiard Cao Cấp',
    description: 'Các loại gậy billiard cao cấp dành cho người chơi chuyên nghiệp',
    parentName: 'Gậy Billiard',
    image: {
      url: '/images/categories/gay-billiard-cao-cap.jpg',
      alt: 'Gậy Billiard Cao Cấp',
    },
    order: 1,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Gậy Billiard Phổ Thông',
    description: 'Các loại gậy billiard giá cả phải chăng cho người mới chơi',
    parentName: 'Gậy Billiard',
    image: {
      url: '/images/categories/gay-billiard-pho-thong.jpg',
      alt: 'Gậy Billiard Phổ Thông',
    },
    order: 2,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Gậy Billiard Thi Đấu',
    description: 'Các loại gậy billiard chuyên dụng cho thi đấu',
    parentName: 'Gậy Billiard',
    image: {
      url: '/images/categories/gay-billiard-thi-dau.jpg',
      alt: 'Gậy Billiard Thi Đấu',
    },
    order: 3,
    isActive: true,
    isVisible: true,
  },

  // Danh mục con của "Bi Billiard"
  {
    name: 'Bi Pool',
    description: 'Bộ bi dành cho billiard lỗ (Pool)',
    parentName: 'Bi Billiard',
    image: {
      url: '/images/categories/bi-pool.jpg',
      alt: 'Bi Pool',
    },
    order: 1,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Bi Carom',
    description: 'Bộ bi dành cho billiard không lỗ (Carom)',
    parentName: 'Bi Billiard',
    image: {
      url: '/images/categories/bi-carom.jpg',
      alt: 'Bi Carom',
    },
    order: 2,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Bi Snooker',
    description: 'Bộ bi dành cho billiard snooker',
    parentName: 'Bi Billiard',
    image: {
      url: '/images/categories/bi-snooker.jpg',
      alt: 'Bi Snooker',
    },
    order: 3,
    isActive: true,
    isVisible: true,
  },

  // Danh mục con của "Phụ Kiện"
  {
    name: 'Phấn Billiard',
    description: 'Các loại phấn billiard chất lượng cao',
    parentName: 'Phụ Kiện',
    image: {
      url: '/images/categories/phan-billiard.jpg',
      alt: 'Phấn Billiard',
    },
    order: 1,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Găng Tay',
    description: 'Găng tay billiard giúp tăng độ chính xác',
    parentName: 'Phụ Kiện',
    image: {
      url: '/images/categories/gang-tay.jpg',
      alt: 'Găng Tay Billiard',
    },
    order: 2,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Túi Đựng Gậy',
    description: 'Các loại túi đựng gậy billiard đa dạng kích thước',
    parentName: 'Phụ Kiện',
    image: {
      url: '/images/categories/tui-dung-gay.jpg',
      alt: 'Túi Đựng Gậy Billiard',
    },
    order: 3,
    isActive: true,
    isVisible: true,
  },

  // Danh mục con của "Bàn Billiard"
  {
    name: 'Bàn Pool',
    description: 'Bàn billiard lỗ tiêu chuẩn quốc tế',
    parentName: 'Bàn Billiard',
    image: {
      url: '/images/categories/ban-pool.jpg',
      alt: 'Bàn Pool',
    },
    order: 1,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Bàn Carom',
    description: 'Bàn billiard không lỗ chuyên nghiệp',
    parentName: 'Bàn Billiard',
    image: {
      url: '/images/categories/ban-carom.jpg',
      alt: 'Bàn Carom',
    },
    order: 2,
    isActive: true,
    isVisible: true,
  },
  {
    name: 'Bàn Snooker',
    description: 'Bàn billiard snooker đạt tiêu chuẩn thi đấu',
    parentName: 'Bàn Billiard',
    image: {
      url: '/images/categories/ban-snooker.jpg',
      alt: 'Bàn Snooker',
    },
    order: 3,
    isActive: true,
    isVisible: true,
  },
];

/**
 * Hàm seed danh mục chính
 */
const seedMainCategories = async () => {
  logger.info('Seeding main categories...');

  try {
    // Xóa tất cả danh mục hiện có nếu cần thiết
    // await Category.deleteMany({});

    // Thêm trường slug và timestamps cho mỗi danh mục
    const mainCategoriesWithSlug = mainCategories.map((category) => ({
      ...category,
      slug: slugify(category.name),
      ancestors: [],
      level: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Chèn danh mục vào database
    await Category.insertMany(mainCategoriesWithSlug);

    logger.info(`Seeded ${mainCategoriesWithSlug.length} main categories successfully!`);
    return mainCategoriesWithSlug;
  } catch (error) {
    logger.error('Error seeding main categories:', error);
    throw error;
  }
};

/**
 * Hàm seed danh mục con
 */
const seedSubCategories = async (mainCategoriesData) => {
  logger.info('Seeding sub categories...');

  try {
    // Chuẩn bị danh mục con với slug, parent, ancestors và level
    const subcategoriesWithDetails = [];

    for (const subCategory of subCategories) {
      // Tìm danh mục cha tương ứng
      const parent = mainCategoriesData.find((cat) => cat.name === subCategory.parentName);

      if (!parent) {
        logger.warn(
          `Parent category "${subCategory.parentName}" not found for "${subCategory.name}"`
        );
        continue;
      }

      // Chuẩn bị thông tin danh mục con
      const subCategoryWithDetails = {
        ...subCategory,
        slug: slugify(subCategory.name),
        parent: parent._id,
        ancestors: [
          {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
          },
        ],
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Loại bỏ trường parentName vì không cần thiết nữa
      delete subCategoryWithDetails.parentName;

      subcategoriesWithDetails.push(subCategoryWithDetails);
    }

    // Chèn danh mục con vào database
    await Category.insertMany(subcategoriesWithDetails);

    logger.info(`Seeded ${subcategoriesWithDetails.length} sub categories successfully!`);
  } catch (error) {
    logger.error('Error seeding sub categories:', error);
    throw error;
  }
};

/**
 * Hàm chính để seed tất cả danh mục
 */
const seedCategories = async () => {
  try {
    logger.info('Starting category seeding process...');

    // Kiểm tra xem đã có danh mục nào chưa
    const existingCategories = await Category.countDocuments();

    if (existingCategories > 0) {
      logger.info(`Found ${existingCategories} existing categories. Skipping seeding process.`);
      return;
    }

    // Seed danh mục chính trước
    const mainCategoriesData = await seedMainCategories();

    // Seed danh mục con sau khi đã có danh mục chính
    await seedSubCategories(mainCategoriesData);

    logger.info('Category seeding completed successfully!');
  } catch (error) {
    logger.error('Category seeding failed:', error);
    throw error;
  }
};

module.exports = seedCategories;
/**
 * Chạy script này để seed danh mục vào database
 * Sử dụng lệnh: node src/seeds/scripts/categorySeeder.js
 * Đảm bảo đã kết nối với MongoDB trước khi chạy script này
 */
