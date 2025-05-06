/**
 * Controller cho quản lý người dùng
 * @author Steve
 * @project RunOut-Biliard
 */

const User = require('../../data/models/user.model');
const { ApiError, isOwnerOrAdmin } = require('../middleware/authMiddleware');
const catchAsync = require('../../utils/catchAsync');
const logger = require('../../config/logger');
const responseHandler = require('../../utils/responseHandler');

/**
 * Lấy danh sách người dùng (với phân trang và filter)
 */
exports.getUsers = catchAsync(async (req, res, next) => {
  // Xử lý query params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';

  // Xây dựng filter
  const filter = {};

  // Lọc theo role nếu có
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Lọc theo trạng thái active
  if (req.query.isActive) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Tìm kiếm theo tên hoặc email
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Thực hiện query
  const users = await User.find(filter).sort(sort).skip(skip).limit(limit).select('-password');

  // Đếm tổng số users phù hợp với filter
  const total = await User.countDocuments(filter);

  // Tính toán thông tin phân trang
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  responseHandler.success(res, {
    results: users.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
    data: users,
  });
});

/**
 * Lấy thông tin người dùng theo ID
 * Middleware isOwnerOrAdmin đã được áp dụng ở route
 */
exports.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Tìm user
  const user = await User.findById(userId).select('-password');

  if (!user) {
    return next(new ApiError(404, 'Không tìm thấy người dùng'));
  }

  responseHandler.success(res, { data: user });
});

/**
 * Tạo người dùng mới (chỉ admin)
 * Middleware restrictTo('admin') đã được áp dụng ở route
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(409, 'Email đã được sử dụng'));
  }

  // Tạo user mới
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    phone,
    // Admin tạo user thì mặc định đã xác thực email
    emailVerified: true,
  });

  // Không gửi password trong response
  newUser.password = undefined;

  // Ghi log
  logger.info(`User ${newUser.email} đã được tạo bởi ${req.user.email}`);

  responseHandler.created(res, { data: newUser });
});

/**
 * Cập nhật thông tin người dùng
 * Middleware isOwnerOrAdmin đã được áp dụng ở route
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Loại bỏ các trường không được phép cập nhật
  const { password, emailVerified, loginCount, lastLogin, ...updateData } = req.body;

  // Admin có thể cập nhật role
  if (req.user.role !== 'admin') {
    delete updateData.role;
  }

  // Tìm và cập nhật user
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    return next(new ApiError(404, 'Không tìm thấy người dùng'));
  }

  // Ghi log
  logger.info(`User ${updatedUser.email} đã được cập nhật bởi ${req.user.email}`);

  responseHandler.success(res, { data: updatedUser });
});

/**
 * Xóa người dùng
 * Middleware restrictTo('admin') đã được áp dụng ở route
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Xóa user
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new ApiError(404, 'Không tìm thấy người dùng'));
  }

  logger.info(`User ${user.email} đã bị xóa bởi ${req.user.email}`);

  responseHandler.success(res, { message: 'Người dùng đã được xóa thành công' });
});

/**
 * Lấy thông tin profile người dùng hiện tại
 * Middleware authenticate đã được áp dụng ở route
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  // Thông tin người dùng đã được lưu trong req.user từ middleware authenticate
  const user = req.user;

  responseHandler.success(res, { data: user });
});

/**
 * Thay đổi mật khẩu
 * Middleware authenticate đã được áp dụng ở route
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'));
  }

  // Lấy user hiện tại với password
  /**
   * @type {import('mongoose').Document & {
   *   password: string,
   *   correctPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>
   * }}
   */
  const user = await User.findById(req.user.id).select('+password');

  // Kiểm tra mật khẩu hiện tại
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new ApiError(401, 'Mật khẩu hiện tại không đúng'));
  }

  // Cập nhật mật khẩu
  user.password = newPassword;
  await user.save();

  // Không gửi password trong response
  user.password = undefined;

  // Ghi log
  logger.info(`User ${user.email} đã thay đổi mật khẩu`);

  responseHandler.success(res, { message: 'Mật khẩu đã được cập nhật thành công' });
});

/**
 * Vô hiệu hóa tài khoản người dùng
 * Middleware restrictTo('admin') đã được áp dụng ở route
 */
exports.deactivateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select(
    '-password'
  );

  if (!user) {
    return next(new ApiError(404, 'Không tìm thấy người dùng'));
  }

  logger.info(`User ${user.email} đã bị vô hiệu hóa bởi ${req.user.email}`);

  responseHandler.success(res, {
    message: 'Tài khoản người dùng đã bị vô hiệu hóa',
    data: user,
  });
});

/**
 * Kích hoạt lại tài khoản người dùng
 * Middleware restrictTo('admin') đã được áp dụng ở route
 */
exports.activateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true }).select(
    '-password'
  );

  if (!user) {
    return next(new ApiError(404, 'Không tìm thấy người dùng'));
  }

  logger.info(`User ${user.email} đã được kích hoạt lại bởi ${req.user.email}`);

  responseHandler.success(res, {
    message: 'Tài khoản người dùng đã được kích hoạt lại',
    data: user,
  });
});
