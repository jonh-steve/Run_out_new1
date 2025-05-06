module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!**/node_modules/**', '!**/vendor/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  // Setup file trước khi chạy tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Tùy chọn đối với môi trường test
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  verbose: true,
  // Tự động xóa các mocks giữa các tests
  clearMocks: true,
  // Timeout cho tests
  testTimeout: 10000,
};
