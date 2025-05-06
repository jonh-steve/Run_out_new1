// @ts-nocheck
/**
 * Controller cho xác thực người dùng
 * @author Steve
 * @project RunOut-Biliard
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ApiError } = require('../../middleware/errorHandler');
const User = require('../../data/models/user.model');
const catchAsync = require('../../utils/catchAsync');
const logger = require('../../config/logger');
const environment = require('../../config/environment');
const { sendEmail } = require('../../services/email/emailService');

/**
 * Tạo JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    environment.auth.jwtSecret,
    { expiresIn: environment.auth.jwtExpiresIn }
  );
};

/**
 * Tạo refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    environment.auth.jwtRefreshSecret,
    { expiresIn: environment.auth.jwtRefreshExpiresIn }
  );
};

/**
 * Đăng ký người dùng mới
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  
  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(409, 'Email đã được sử dụng'));
  }
  
  // Tạo verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 giờ
  
  // Tạo user mới
  const newUser = await User.create({
    name,
    email,
    password,
    phone,
    emailVerificationToken: crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex'),
    emailVerificationExpires: verificationTokenExpires,
  });
  
  try {
    // Gửi email xác thực
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Xác thực tài khoản RunOut-Biliard',
      template: 'verification',
      context: {
        name,
        verifyURL,
      },
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Người dùng đã được tạo. Vui lòng kiểm tra email để xác thực tài khoản.',
    });
  } catch (error) {
    // Xử lý lỗi gửi email
    logger.error(`Không thể gửi email xác thực: ${error.message}`);
    
    // Xóa user trong trường hợp email không gửi được
    await User.findByIdAndDelete(newUser._id);
    
    return next(new ApiError(
      500,
      'Đã xảy ra lỗi khi gửi email xác thực. Vui lòng thử lại sau.'
    ));
  }
});

/**
 * Đăng nhập
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Kiểm tra email và password
  if (!email || !password) {
    return next(new ApiError(400, 'Vui lòng cung cấp email và mật khẩu'));
  }
  
  // Tìm user trong database
  const user = await User.findOne({ email }).select('+password');
  
  // Kiểm tra user tồn tại và password đúng
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError(401, 'Email hoặc mật khẩu không đúng'));
  }
  
  // Kiểm tra email đã xác thực chưa
  if (!user.emailVerified) {
    return next(new ApiError(401, 'Vui lòng xác thực email trước khi đăng nhập'));
  }
  
  // Kiểm tra user có active không
  if (!user.isActive) {
    return next(new ApiError(401, 'Tài khoản của bạn đã bị vô hiệu hóa'));
  }
  
  // Tạo token
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Cập nhật thông tin đăng nhập
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });
  
  // Không gửi password trong response
  user.password = undefined;
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
      refreshToken,
    },
  });
});

/**
 * Đăng xuất
 */
exports.logout = catchAsync(async (req, res, next) => {
  // Đối với JWT, không cần làm gì ở phía server
  // Client cần xóa token
  
  res.status(200).json({
    status: 'success',
    message: 'Đăng xuất thành công',
  });
});

/**
 * Làm mới access token bằng refresh token
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return next(new ApiError(400, 'Refresh token không được cung cấp'));
  }
  
  try {
    // Xác thực refresh token
    const decoded = jwt.verify(refreshToken, environment.auth.jwtRefreshSecret);
    
    // Tìm user
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'));
    }
    
    // Tạo token mới
    const newToken = generateToken(user);
    
    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return next(new ApiError(401, 'Refresh token không hợp lệ hoặc đã hết hạn'));
  }
});

/**
 * Quên mật khẩu
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  // Tìm user theo email
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new ApiError(404, 'Không tìm thấy người dùng với email này'));
  }
  
  // Tạo reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  try {
    // Tạo URL reset password
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // Gửi email
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu (có hiệu lực trong 10 phút)',
      template: 'resetPassword',
      context: {
        name: user.name,
        resetURL,
      },
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Token đã được gửi đến email',
    });
  } catch (error) {
    // Xử lý lỗi gửi email
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    logger.error(`Không thể gửi email đặt lại mật khẩu: ${error.message}`);
    
    return next(new ApiError(
      500,
      'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau!'
    ));
  }
});

/**
 * Đặt lại mật khẩu
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Tìm user với token và kiểm tra thời hạn
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  
  // Kiểm tra nếu token hợp lệ
  if (!user) {
    return next(new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn'));
  }
  
  // Cập nhật mật khẩu
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  // Đăng nhập người dùng
  const jwtToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  
  res.status(200).json({
    status: 'success',
    message: 'Mật khẩu đã được cập nhật',
    data: {
      token: jwtToken,
      refreshToken,
    },
  });
});

/**
 * Xác thực email
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Tìm user và kiểm tra thời hạn
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
  
  // Kiểm tra nếu token hợp lệ
  if (!user) {
    return next(new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn'));
  }
  
  // Cập nhật trạng thái xác thực
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    message: 'Email đã được xác thực thành công',
  });
});