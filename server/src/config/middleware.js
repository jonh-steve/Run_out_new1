/**
 * Cấu hình middleware
 * @author Steve
 * @project RunOut-Biliard
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const environment = require('./environment');
const logger = require('./logger');

/**
 * Cấu hình và áp dụng các middleware cơ bản cho ứng dụng Express
 * @param {express.Application} app - Ứng dụng Express
 */
const setupCommonMiddleware = (app) => {
  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: environment.app.environment === 'production',
      crossOriginEmbedderPolicy: environment.app.environment === 'production',
      crossOriginOpenerPolicy: environment.app.environment === 'production',
      crossOriginResourcePolicy: environment.app.environment === 'production',
    })
  ); // Bảo mật HTTP headers

  // CORS middleware
  app.use(
    cors({
      origin: environment.cors.origin,
      methods: environment.cors.methods.split(','),
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'CSRF-Token'],
      exposedHeaders: ['Content-Disposition', 'CSRF-Token'],
      credentials: true,
      maxAge: 86400, // 24 giờ
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10kb' })); // Limit JSON body size
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Cookie parsing middleware
  app.use(cookieParser(environment.app.cookieSecret));

  // Compression middleware
  app.use(compression());

  // Logger middleware
  if (environment.app.environment === 'development') {
    app.use(morgan('dev'));
  } else {
    // Sử dụng winston cho production
    app.use(
      morgan('combined', {
        stream: {
          write: (message) => logger.http(message.trim()),
        },
      })
    );
  }
};

/**
 * Cấu hình middleware bảo mật bổ sung
 * @param {express.Application} app - Ứng dụng Express
 */
const setupSecurityMiddleware = (app) => {
  // Rate limiting middleware
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Limit mỗi IP 100 requests mỗi windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
    },
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json(options.message);
    },
  });

  // Áp dụng rate limit cho tất cả các routes /api
  app.use('/api', apiLimiter);

  // Middleware chống brute force cho authentication
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 5, // Giới hạn 5 lần thử trong 1 giờ
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 1 giờ',
    },
    handler: (req, res, next, options) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json(options.message);
    },
  });

  // Áp dụng auth limiter cho routes đăng nhập/đăng ký
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // CSRF protection middleware
  if (environment.app.environment === 'production') {
    const csrfProtection = csrf({ cookie: true });

    // Áp dụng CSRF protection cho các routes không phải API public
    app.use('/api/admin', csrfProtection);
    app.use('/api/user', csrfProtection);

    // Middleware để cung cấp CSRF token
    app.get('/api/csrf-token', csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });
  }
};

/**
 * Setup middleware xử lý lỗi
 * @param {express.Application} app - Ứng dụng Express
 */
const setupErrorHandlingMiddleware = (app) => {
  // Middleware xử lý 404 - Phải đặt sau tất cả các routes
  app.use((req, res, next) => {
    res.status(404).json({
      status: 'error',
      message: 'Không tìm thấy tài nguyên yêu cầu',
    });
    next(); // Gọi next() để chuyển sang middleware tiếp theo
  });

  // Middleware xử lý lỗi toàn cục
  app.use((err, req, res, next) => {
    // Xử lý lỗi CSRF
    if (err.code === 'EBADCSRFTOKEN') {
      logger.error(`CSRF attack detected from IP: ${req.ip}`);
      return res.status(403).json({
        status: 'error',
        message: 'Phiên làm việc không hợp lệ, vui lòng thử lại',
      });
    }

    // Log lỗi
    logger.error(`Error: ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    // Trả về lỗi cho client
    const statusCode = err.statusCode || 500;
    const message =
      environment.app.environment === 'production' && statusCode === 500
        ? 'Đã xảy ra lỗi, vui lòng thử lại sau'
        : err.message;

    res.status(statusCode).json({
      status: 'error',
      message,
      ...(environment.app.environment !== 'production' && { stack: err.stack }),
    });

    next(); // Thêm câu lệnh gọi next() sau khi xử lý lỗi toàn cục
  });
};

/**
 * Setup tất cả middleware
 * @param {express.Application} app - Ứng dụng Express
 */
const setupAllMiddleware = (app) => {
  setupCommonMiddleware(app);
  setupSecurityMiddleware(app);

  // Middleware cho static files
  app.use('/uploads', express.static(environment.paths.uploads));

  // Middleware thêm signature cho tất cả các responses
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', `RunOut-Biliard - ${environment.app.signature}`);
    next();
  });

  // Middleware xử lý lỗi phải được đặt cuối cùng
  // Lưu ý: Phải gọi sau khi đã thiết lập tất cả các routes
};

module.exports = {
  setupCommonMiddleware,
  setupSecurityMiddleware,
  setupErrorHandlingMiddleware,
  setupAllMiddleware,
};
