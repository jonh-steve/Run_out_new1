// server/src/data/repositories/userRepository.js
const User = require('../models/user.model');
const ApiError = require('../../common/errors/apiError');

class UserRepository {
  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 50, page = 1, select = '' } = options;
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).select(select).exec(),
      User.countDocuments(filter),
    ]);

    return {
      data: users,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findById(id, select = '') {
    const user = await User.findById(id).select(select).exec();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async findByEmail(email) {
    const user = await User.findOne({ email }).exec();
    return user;
  }

  async create(data) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    const user = new User(data);
    return await user.save();
  }

  async update(id, data) {
    // Nếu có cập nhật email, kiểm tra email đã tồn tại chưa
    if (data.email) {
      const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } }).exec();

      if (existingUser) {
        throw new ApiError(409, 'Email already exists');
      }
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async delete(id) {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return { success: true };
  }

  async updatePassword(id, newPassword) {
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.password = newPassword;
    return await user.save();
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  async findByVerificationToken(token) {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
  }

  async updateLoginStats(id) {
    return await User.findByIdAndUpdate(id, {
      $inc: { loginCount: 1 },
      lastLogin: Date.now(),
    });
  }
}

module.exports = new UserRepository();
