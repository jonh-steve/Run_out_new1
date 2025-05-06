// server/tests/repositories/userRepository.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../../src/data/models/user.model');
const UserRepository = require('../../../src/data/repositories/userRepository');

let mongoServer;
const userRepository = new UserRepository();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('UserRepository', () => {
  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const createdUser = await userRepository.create(userData);
      const foundUser = await userRepository.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe(userData.name);
    });

    it('should return null if user not found', async () => {
      const foundUser = await userRepository.findById(mongoose.Types.ObjectId());
      expect(foundUser).toBeNull();
    });

    it('should return a user if found by valid id', async () => {
      const userData = {
        name: 'Another User',
        email: 'another@example.com',
        password: 'password456',
        role: 'admin',
      };

      const createdUser = await userRepository.create(userData);
      const foundUser = await userRepository.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe(userData.name);
    });
  });

  // Thêm các test cases khác cho các phương thức còn lại
});
