// server/src/seeds/data/products.js

module.exports = [
  {
    name: 'Gậy Billiard Pro Series X1',
    slug: 'gay-billiard-pro-series-x1',
    description: {
      short: 'Gậy billiard chuyên nghiệp với trọng lượng cân bằng hoàn hảo',
      long: 'Gậy billiard Pro Series X1 được thiết kế dành cho người chơi chuyên nghiệp, với thân gậy làm từ gỗ sồi cao cấp và đầu tip cứng. Sản phẩm mang lại độ chính xác và cảm giác tuyệt vời khi chơi.',
    },
    category: 'gay-billiard-chuyen-nghiep', // slug của danh mục
    brand: 'ProCue',
    manufacturer: 'Billiard Master',
    countryOfOrigin: 'USA',
    price: 1500000,
    stock: 15,
    sku: 'PC-X1-001',
    images: [
      {
        url: '/assets/products/pc-x1-001-main.jpg',
        alt: 'Gậy Billiard Pro Series X1 - Hình chính',
        isPrimary: true,
      },
      {
        url: '/assets/products/pc-x1-001-angle.jpg',
        alt: 'Gậy Billiard Pro Series X1 - Góc nhìn khác',
        isPrimary: false,
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
    name: 'Bộ Bi-a Pro Tournament',
    slug: 'bo-bi-a-pro-tournament',
    description: {
      short: 'Bộ bi-a tiêu chuẩn giải đấu chuyên nghiệp',
      long: 'Bộ bi-a Pro Tournament được sản xuất với độ chính xác cao, đạt tiêu chuẩn giải đấu quốc tế. Các viên bi được làm từ nhựa phenolic chất lượng cao, đảm bảo độ bền và độ chính xác trong mọi pha chơi.',
    },
    category: 'bi-a', // slug của danh mục
    brand: 'ProGame',
    manufacturer: 'Aramith',
    countryOfOrigin: 'Belgium',
    price: 850000,
    stock: 10,
    sku: 'PB-T1-001',
    images: [
      {
        url: '/assets/products/pb-t1-001-main.jpg',
        alt: 'Bộ Bi-a Pro Tournament - Hình chính',
        isPrimary: true,
      },
    ],
    features: [
      'Tiêu chuẩn giải đấu quốc tế',
      'Làm từ nhựa phenolic cao cấp',
      'Độ chính xác cao',
      'Bao gồm 16 viên bi',
    ],
    specifications: {
      material: 'Phenolic resin',
      weight: 170,
      diameter: 57.2,
      set: '16 balls',
    },
    isActive: true,
    isPromoted: true,
    isFeatured: false,
  },
  {
    name: 'Bàn Billiard Champion 9ft',
    slug: 'ban-billiard-champion-9ft',
    description: {
      short: 'Bàn billiard cao cấp 9ft dành cho các câu lạc bộ chuyên nghiệp',
      long: 'Bàn Billiard Champion 9ft được thiết kế dành cho các câu lạc bộ và giải đấu chuyên nghiệp. Bàn được làm từ gỗ sồi Mỹ cao cấp, khung bàn vững chắc và mặt bàn được phủ vải wool-nylon blend cao cấp đảm bảo độ bền và cảm giác chơi tuyệt vời.',
    },
    category: 'ban-billiard', // slug của danh mục
    brand: 'Champion',
    manufacturer: 'Billiard Master',
    countryOfOrigin: 'USA',
    price: 45000000,
    stock: 3,
    sku: 'BT-C9-001',
    images: [
      {
        url: '/assets/products/bt-c9-001-main.jpg',
        alt: 'Bàn Billiard Champion 9ft - Hình chính',
        isPrimary: true,
      },
      {
        url: '/assets/products/bt-c9-001-angle.jpg',
        alt: 'Bàn Billiard Champion 9ft - Góc nhìn khác',
        isPrimary: false,
      },
    ],
    features: [
      'Kích thước chuẩn 9ft',
      'Làm từ gỗ sồi Mỹ cao cấp',
      'Mặt bàn phủ vải wool-nylon blend',
      'Khung bàn vững chắc',
    ],
    specifications: {
      length: 274,
      width: 137,
      height: 79,
      frameType: '1-piece slate',
      clothType: 'Championship wool-nylon blend',
      railCushions: 'K-66 profile',
    },
    isActive: true,
    isPromoted: false,
    isFeatured: true,
  },
];
