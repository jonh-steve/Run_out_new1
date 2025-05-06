// server/src/seeds/productSeeder.js

const Product = require('../data/products');
const Category = require('../data/categories');
// const mongoose = require('mongoose');

async function seedProducts() {
  console.log('Seeding products...');

  // Xóa tất cả sản phẩm hiện có (chỉ dùng trong development)
  if (process.env.NODE_ENV !== 'production') {
    await Product.deleteMany({});
  }

  // Lấy ID các danh mục
  const gayChuyenNghiepCategory = await Category.findOne({ slug: 'gay-billiard-chuyen-nghiep' });
  const gayPhoThongCategory = await Category.findOne({ slug: 'gay-billiard-pho-thong' });
  const biCategory = await Category.findOne({ slug: 'bi-billiard' });

  if (!gayChuyenNghiepCategory || !gayPhoThongCategory || !biCategory) {
    console.error('Categories not found. Please run category seeder first.');
    return;
  }

  // Tạo sản phẩm mẫu
  const sampleProducts = [
    {
      name: 'Gậy Billiard Pro Series X1',
      slug: 'gay-billiard-pro-series-x1',
      description: {
        short: 'Gậy billiard chuyên nghiệp với trọng lượng cân bằng hoàn hảo',
        long: 'Gậy billiard Pro Series X1 được thiết kế dành cho người chơi chuyên nghiệp, với thân gậy làm từ gỗ sồi cao cấp và đầu tip cứng. Sản phẩm mang lại độ chính xác và cảm giác tuyệt vời khi chơi.',
      },
      category: gayChuyenNghiepCategory._id,
      brand: 'ProCue',
      manufacturer: 'Billiard Master',
      countryOfOrigin: 'USA',
      price: 1500000,
      stock: 15,
      sku: 'PC-X1-001',
      images: [
        {
          url: 'https://example.com/products/pc-x1-001-main.jpg',
          alt: 'Gậy Billiard Pro Series X1 - Hình chính',
          isPrimary: true,
        },
      ],
      features: [
        'Thân gậy làm từ gỗ sồi cao cấp',
        'Đầu tip cứng độ bền cao',
        'Trọng lượng cân bằng hoàn hảo',
        'Tay cầm chống trượt',
      ],
      specifications: {
        weight: 567,
        length: 147,
        diameter: 13,
        material: 'Gỗ sồi',
        tipSize: '13mm',
        wrap: 'Irish linen',
      },
      isActive: true,
      isPromoted: true,
      isFeatured: true,
    },
    {
      name: 'Gậy Billiard Starter S1',
      slug: 'gay-billiard-starter-s1',
      description: {
        short: 'Gậy billiard phổ thông dành cho người mới chơi',
        long: 'Gậy billiard Starter S1 là lựa chọn hoàn hảo cho người mới bắt đầu chơi billiard. Với thiết kế cân bằng và dễ sử dụng, S1 giúp người chơi nhanh chóng làm quen với kỹ thuật cơ bản.',
      },
      category: gayPhoThongCategory._id,
      brand: 'StarterCue',
      manufacturer: 'Billiard Master',
      countryOfOrigin: 'Vietnam',
      price: 750000,
      stock: 30,
      sku: 'SC-S1-001',
      images: [
        {
          url: 'https://example.com/products/sc-s1-001-main.jpg',
          alt: 'Gậy Billiard Starter S1 - Hình chính',
          isPrimary: true,
        },
      ],
      features: [
        'Thiết kế cân bằng dễ sử dụng',
        'Thân gậy làm từ gỗ maple',
        'Đầu tip mềm thân thiện cho người mới',
        'Giá cả phải chăng',
      ],
      specifications: {
        weight: 540,
        length: 145,
        diameter: 13,
        material: 'Gỗ maple',
        tipSize: '13mm',
        wrap: 'Nylon',
      },
      isActive: true,
      isPromoted: false,
      isFeatured: true,
    },
    {
      name: 'Bộ Bi Billiard Pro Tournament',
      slug: 'bo-bi-billiard-pro-tournament',
      description: {
        short: 'Bộ bi billiard chuyên nghiệp cho giải đấu',
        long: 'Bộ Bi Billiard Pro Tournament được làm từ chất liệu cao cấp, đạt chuẩn thi đấu quốc tế. Độ bóng và cân bằng hoàn hảo giúp đảm bảo các ván đấu công bằng và chính xác.',
      },
      category: biCategory._id,
      brand: 'MasterBall',
      manufacturer: 'Professional Billiards',
      countryOfOrigin: 'Belgium',
      price: 2200000,
      stock: 10,
      sku: 'MB-PT-001',
      images: [
        {
          url: 'https://example.com/products/mb-pt-001-main.jpg',
          alt: 'Bộ Bi Billiard Pro Tournament - Hình chính',
          isPrimary: true,
        },
      ],
      features: [
        'Chuẩn thi đấu quốc tế',
        'Chất liệu resin cao cấp',
        'Độ bóng và cân bằng hoàn hảo',
        'Tuổi thọ cao',
      ],
      specifications: {
        diameter: 57.2,
        weight: 170,
        material: 'Resin',
        quantity: 16,
      },
      isActive: true,
      isPromoted: true,
      isFeatured: false,
    },
  ];

  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products successfully.`);
}

module.exports = seedProducts;
