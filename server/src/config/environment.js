/**
 * Cấu hình biến môi trường
 * @author Steve
 * @project RunOut-Biliard
 */

// Load biến môi trường từ file .env
require('dotenv').config();

// Lấy biến môi trường hoặc giá trị mặc định
const getEnv = (key, defaultValue = undefined) => {
  return process.env[key] || defaultValue;
};

// Biến môi trường
const environment = {
  // Thông tin ứng dụng
  app: {
    name: getEnv('APP_NAME', 'RunOut-Biliard'),
    signature: getEnv('SIGNATURE', 'Steve'),
    environment: getEnv('NODE_ENV', 'development'),
    port: parseInt(getEnv('PORT', '5000'), 10),
    host: getEnv('HOST', 'localhost'),
  },

  // Cơ sở dữ liệu
  db: {
    uri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/runout_biliard'),
    uriTest: getEnv('MONGODB_URI_TEST', 'mongodb://localhost:27017/runout_biliard_test'),
  },

  // Xác thực
  auth: {
    jwtSecret: getEnv('JWT_SECRET', 'your_jwt_secret_key_here'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET', 'your_refresh_secret_key_here'),
    jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  // CORS
  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
    methods: getEnv('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE'),
  },

  // Logging
  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
    colorize: getEnv('NODE_ENV', 'development') === 'development',
  },

  // Đường dẫn tĩnh
  paths: {
    uploads: getEnv('UPLOAD_PATH', 'uploads'),
  },

  // Thanh toán
  payment: {
    vnpay: {
      tmnCode: getEnv('VNPAY_TMN_CODE', ''),
      secretKey: getEnv('VNPAY_SECRET_KEY', ''),
      returnUrl: getEnv('VNPAY_RETURN_URL', 'http://localhost:5000/api/payments/vnpay-return'),
      ipnUrl: getEnv('VNPAY_IPN_URL', 'http://localhost:5000/api/payments/vnpay-ipn'),
    },
  },

  // Redis
  redis: {
    url: getEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  // Email
  email: {
    host: getEnv('EMAIL_HOST', 'smtp.example.com'),
    port: parseInt(getEnv('EMAIL_PORT', '587'), 10),
    secure: getEnv('EMAIL_SECURE', 'false') === 'true',
    user: getEnv('EMAIL_USER', 'example@example.com'),
    pass: getEnv('EMAIL_PASS', 'password'),
  },
};

// Validate các biến môi trường quan trọng
const validateEnvironment = () => {
  // Kiểm tra biến môi trường quan trọng
  if (environment.app.environment === 'production') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET không được cấu hình cho môi trường production');
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI không được cấu hình cho môi trường production');
    }
  }
};

// Nếu ở môi trường production, validate các biến môi trường
if (environment.app.environment === 'production') {
  validateEnvironment();
}

module.exports = environment;
