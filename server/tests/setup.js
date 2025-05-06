// Load biến môi trường từ .env.test nếu tồn tại
require('dotenv').config({ path: '.env.test' });

// Thiết lập cho MongoDB Memory Server nếu sử dụng cho testing
// Uncomment nếu sử dụng mongodb-memory-server cho test
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const mongoose = require('mongoose');

// let mongoServer;

// Hàm thiết lập trước khi chạy tất cả tests
beforeAll(async () => {
  // Thiết lập các biến môi trường cần thiết cho tests
  process.env.NODE_ENV = 'test';

  // Nếu sử dụng MongoDB Memory Server
  /*
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI_TEST = mongoUri;
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  */

  // Các thiết lập khác trước tests
  console.log('Test suite started');
});

// Hàm dọn dẹp sau mỗi test
afterEach(async () => {
  // Dọn dẹp mocks hoặc spy functions
  jest.clearAllMocks();

  // Xóa tất cả collections sau mỗi test
  /*
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
  */
});

// Hàm dọn dẹp sau khi chạy tất cả tests
afterAll(async () => {
  // Đóng kết nối MongoDB nếu đang mở
  /*
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  */

  // Các dọn dẹp khác
  console.log('Test suite completed');
});

// Global matchers tùy chỉnh
expect.extend({
  // Ví dụ về custom matcher
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
