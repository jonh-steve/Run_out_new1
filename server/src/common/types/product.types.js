/**
 * Các kiểu dữ liệu liên quan đến sản phẩm
 */

// Enum trạng thái sản phẩm
const ProductStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  COMING_SOON: 'coming_soon',
  DISCONTINUED: 'discontinued',
};

// Enum loại sản phẩm
const ProductType = {
  CUE: 'cue', // Gậy billiard
  BALL: 'ball', // Bi
  ACCESSORIES: 'accessories', // Phụ kiện
  TABLE: 'table', // Bàn billiard
  CHALK: 'chalk', // Phấn
};

module.exports = {
  ProductStatus,
  ProductType,
};
