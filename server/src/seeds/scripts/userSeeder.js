// server/src/seeds/userSeeder.js

const { User } = require('../data/users');
const bcrypt = require('bcrypt');

async function seedUsers() {
  console.log('Seeding users...');

  // Xóa tất cả người dùng hiện có (chỉ dùng trong development)
  if (process.env.NODE_ENV !== 'production') {
    await User.deleteMany({});
  }

  // Hash mật khẩu
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
  const userPasswordHash = await bcrypt.hash('user123', saltRounds);

  // Tạo người dùng mẫu
  const users = [
    {
      name: 'Admin User',
      email: 'admin@runout-biliard.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '0901234567',
      address: {
        street: '123 Nguyễn Huệ',
        city: 'Hồ Chí Minh',
        state: '',
        zipCode: '70000',
        country: 'Việt Nam',
      },
      isActive: true,
      emailVerified: true,
      preferences: {
        language: 'vi',
        notifications: {
          email: true,
          marketing: true,
        },
      },
    },
    {
      name: 'Regular User',
      email: 'user@example.com',
      password: userPasswordHash,
      role: 'user',
      phone: '0909876543',
      address: {
        street: '456 Lê Lợi',
        city: 'Hà Nội',
        state: '',
        zipCode: '10000',
        country: 'Việt Nam',
      },
      isActive: true,
      emailVerified: true,
      preferences: {
        language: 'vi',
        notifications: {
          email: true,
          marketing: false,
        },
      },
    },
  ];

  await User.insertMany(users);
  console.log(`Seeded ${users.length} users successfully.`);
}

module.exports = seedUsers;
