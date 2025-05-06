/**
 * DTO cho User - chuyển đổi dữ liệu giữa service layer và client
 * @author Steve
 * @project RunOut-Biliard
 */

/**
 * Class UserDTO - chuyển đổi dữ liệu User cho response
 */
class UserDTO {
  /**
   * Chuyển đổi từ model User sang DTO
   * @param {Object} user - User model
   * @returns {Object} - User DTO
   */
  static toDTO(user) {
    if (!user) return null;

    // Chuyển đổi user model thành plain object nếu chưa phải
    const userObj = user.toObject ? user.toObject() : user;

    return {
      id: userObj._id.toString(),
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      avatar: userObj.avatar,
      phone: userObj.phone || '',
      address: userObj.address || {},
      isActive: userObj.isActive,
      emailVerified: userObj.emailVerified,
      lastLogin: userObj.lastLogin,
      loginCount: userObj.loginCount,
      preferences: userObj.preferences || {
        language: 'vi',
        notifications: {
          email: true,
          marketing: true,
        },
      },
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    };
  }

  /**
   * Chuyển đổi một mảng User models sang DTO
   * @param {Array} users - Mảng User models
   * @returns {Array} - Mảng User DTOs
   */
  static toList(users) {
    if (!users || !Array.isArray(users)) return [];
    return users.map((user) => UserDTO.toDTO(user));
  }

  /**
   * Chuyển đổi dữ liệu phân trang từ service
   * @param {Object} paginatedResult - Kết quả phân trang từ service
   * @returns {Object} - Kết quả phân trang đã chuyển đổi
   */
  static toPagination(paginatedResult) {
    return {
      data: UserDTO.toList(paginatedResult.data || paginatedResult.users),
      pagination: {
        total: paginatedResult.totalCount || paginatedResult.pagination.total,
        page: paginatedResult.page || paginatedResult.pagination.page,
        limit: paginatedResult.limit || paginatedResult.pagination.limit,
        totalPages: paginatedResult.totalPages || paginatedResult.pagination.totalPages,
        hasNext: paginatedResult.hasNext || paginatedResult.pagination.hasNext,
        hasPrev: paginatedResult.hasPrev || paginatedResult.pagination.hasPrev,
      },
    };
  }

  /**
   * Chuyển đổi dữ liệu cho profile
   * @param {Object} user - User model
   * @returns {Object} - User profile DTO
   */
  static toProfile(user) {
    if (!user) return null;

    const dto = UserDTO.toDTO(user);

    // Thêm các thông tin bổ sung cho profile nếu cần
    return {
      ...dto,
      // Có thể thêm các trường khác ở đây
    };
  }

  /**
   * Chuyển đổi dữ liệu cho admin (bao gồm thông tin nhạy cảm hơn)
   * @param {Object} user - User model
   * @returns {Object} - Admin User DTO
   */
  static toAdminDTO(user) {
    if (!user) return null;

    const dto = UserDTO.toDTO(user);

    // Thêm các thông tin admin cần
    return {
      ...dto,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
    };
  }
}

module.exports = UserDTO;
