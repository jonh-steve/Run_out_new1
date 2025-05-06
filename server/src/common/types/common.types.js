/**
 * Các kiểu dữ liệu dùng chung trong ứng dụng
 */

// Tham số phân trang
const PaginationParams = {
  page: Number, // Trang hiện tại
  limit: Number, // Số lượng item mỗi trang
  total: Number, // Tổng số item
  totalPages: Number, // Tổng số trang
};

// Hướng sắp xếp
const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
};

// Điều kiện lọc
const FilterOperator = {
  EQ: 'eq', // Bằng
  NE: 'ne', // Không bằng
  GT: 'gt', // Lớn hơn
  GTE: 'gte', // Lớn hơn hoặc bằng
  LT: 'lt', // Nhỏ hơn
  LTE: 'lte', // Nhỏ hơn hoặc bằng
  IN: 'in', // Trong tập giá trị
  NIN: 'nin', // Không trong tập giá trị
  REGEX: 'regex', // Khớp với biểu thức chính quy
};

module.exports = {
  PaginationParams,
  SortDirection,
  FilterOperator,
};
