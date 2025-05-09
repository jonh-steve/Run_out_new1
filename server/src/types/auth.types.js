/**
 * Các kiểu dữ liệu liên quan đến authentication
 */

// Enum vai trò người dùng
const UserRole = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
};

// Cấu trúc payload trong JWT token
const TokenPayload = {
  id: String, // ID người dùng
  email: String, // Email người dùng
  role: String, // Vai trò người dùng
  iat: Number, // Issued at - thời điểm token được tạo
  exp: Number, // Expiration - thời điểm token hết hạn
};

// Cấu trúc response khi đăng nhập
const AuthResponse = {
  user: Object, // Thông tin người dùng
  token: String, // Access token
  refreshToken: String, // Refresh token
};

module.exports = {
  UserRole,
  TokenPayload,
  AuthResponse,
};
