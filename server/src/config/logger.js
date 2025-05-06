const winston = require('winston');
const path = require('path');

// Định nghĩa các levels của logger
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Chọn level dựa trên môi trường
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Tùy chỉnh format cho logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Định nghĩa các transports cho logger
const transports = [
  // Ghi log đến console
  new winston.transports.Console(),

  // Ghi log errors vào file
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),

  // Ghi tất cả logs vào file
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
];

// Tạo logger với các tùy chọn đã định nghĩa
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Thêm metadata custom để nhận diện ứng dụng
  defaultMeta: {
    service: process.env.APP_NAME || 'runout-biliard',
    signature: process.env.SIGNATURE || 'Steve',
  },
});

module.exports = logger;
