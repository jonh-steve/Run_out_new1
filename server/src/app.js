/**
 * Tệp cấu hình Express chính cho ứng dụng RunOut-Biliard
 * @author Steve
 * @project RunOut-Biliard
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const { connectToDatabase } = require('./config/database');
const config = require('./config/environment');
const logger = require('./config/logger');

// Routes
const productRoutes = require('./api/routes/productRoutes');
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');
// const bookingRoutes = require('./api/routes/bookingRoutes');
// const paymentRoutes = require('./api/routes/paymentRoutes');

// Middleware
const { loggingMiddleware } = require('./api/middleware/loggingMiddleware');
const { errorHandler } = require('./api/middleware/errorMiddleware');
// Sửa cách import authMiddleware - không cần import ở đây vì đã import trong routes

// Khởi tạo app Express
const app = express();

// Cấu hình biến môi trường
dotenv.config();

// Kết nối đến cơ sở dữ liệu
connectToDatabase();

// Cấu hình bảo mật
app.use(helmet()); // Thiết lập các HTTP header bảo mật
app.use(mongoSanitize()); // Bảo vệ khỏi SQL injection
app.use(xss()); // Bảo vệ khỏi XSS attacks
app.use(hpp({ whitelist: ['price', 'date', 'rating'] })); // Bảo vệ khỏi HTTP Parameter Pollution

// Rate limiting để chống DDOS và brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // 100 yêu cầu mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
});

// Áp dụng rate limiting cho tất cả các request API
app.use('/api', limiter);

// CORS config từ biến môi trường
app.use(
  cors({
    origin: config.cors.origin.split(','),
    methods: config.cors.methods,
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Middleware nén response
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10kb' })); // Giới hạn kích thước body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Xử lý cookies

// Ghi log cho requests trong môi trường phát triển
if (config.app.environment === 'development') {
  app.use(morgan('dev'));
}

// Middleware ghi log tùy chỉnh
app.use(loggingMiddleware);

// Thư mục tĩnh cho uploads và tài nguyên công khai
app.use('/uploads', express.static(path.join(__dirname, '..', config.paths.uploads)));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes API
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Không cần thêm middleware ở đây vì đã có trong routes
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/payments', paymentRoutes);

// Route sức khỏe hệ thống
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hệ thống đang hoạt động',
    environment: config.app.environment,
    timestamp: new Date().toISOString(),
  });
});

// Route trang chủ API
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API RunOut-Biliard!',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.redirect('/api-docs'); // Chuyển hướng đến Swagger hoặc trang tài liệu
});

// Xử lý route không tìm thấy
app.all('*', (req, res, next) => {
  const err = new Error(`Không thể tìm thấy ${req.originalUrl} trên server này!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Middleware xử lý lỗi toàn cục
app.use(errorHandler);

// Xử lý sự kiện process
process.on('SIGTERM', () => {
  logger.info('SIGTERM nhận được. Đang chuẩn bị đóng ứng dụng Express...');
});

// Export app cho server.js sử dụng
module.exports = app;
