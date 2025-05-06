// server/src/data/repositories/reviewRepository.js
const Review = require('../models/review.model');
const Product = require('../models/product.model');
const ApiError = require('../../common/errors/apiError');
const mongoose = require('mongoose');

class ReviewRepository {
  // server/src/data/repositories/reviewRepository.js (tiếp)
  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 50, page = 1, populate = [] } = options;
    const skip = (page - 1) * limit;

    const query = Review.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const [reviews, totalCount] = await Promise.all([query.exec(), Review.countDocuments(filter)]);

    return {
      data: reviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findById(id, options = {}) {
    const { populate = [] } = options;

    const query = Review.findById(id);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const review = await query.exec();

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    return review;
  }

  async create(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo review
      const review = new Review(data);
      await review.save({ session });

      // Cập nhật rating cho product
      await this.updateProductRating(data.product, session);

      await session.commitTransaction();
      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async update(id, data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await Review.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session,
      });

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Cập nhật rating cho product
      await this.updateProductRating(review.product, session);

      await session.commitTransaction();
      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async delete(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await Review.findById(id).session(session);

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      const productId = review.product;

      await Review.findByIdAndDelete(id).session(session);

      // Cập nhật rating cho product
      await this.updateProductRating(productId, session);

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateProductRating(productId, session = null) {
    // Lấy tất cả đánh giá được phê duyệt cho sản phẩm
    const aggregateOptions = session ? { session } : {};

    const reviews = await Review.aggregate(
      [
        {
          $match: {
            product: new mongoose.Types.ObjectId(productId),
            'moderation.status': 'approved',
            isVisible: true,
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ],
      aggregateOptions
    );

    let averageRating = 0;
    let count = 0;

    if (reviews.length > 0) {
      averageRating = reviews[0].averageRating;
      count = reviews[0].count;
    }

    // Cập nhật product
    const updateOptions = session ? { session } : {};

    await Product.findByIdAndUpdate(
      productId,
      {
        'ratings.average': parseFloat(averageRating.toFixed(1)),
        'ratings.count': count,
      },
      updateOptions
    );
  }

  async getProductReviews(productId, options = {}) {
    const { sort = 'newest', page = 1, limit = 10, filter = {} } = options;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highestRating: { rating: -1 },
      lowestRating: { rating: 1 },
      mostHelpful: { 'helpfulness.upvotes': -1 },
    };

    const query = {
      product: productId,
      'moderation.status': 'approved',
      isVisible: true,
      ...filter,
    };

    return await this.findAll(query, {
      sort: sortOptions[sort] || sortOptions.newest,
      page,
      limit,
      populate: [{ path: 'user', select: 'name avatar' }],
    });
  }

  async getUserReviews(userId, options = {}) {
    const query = { user: userId };
    return await this.findAll(query, options);
  }

  async moderateReview(reviewId, action, reason, adminId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate action
      if (!['approve', 'reject'].includes(action)) {
        throw new ApiError(400, 'Invalid moderation action');
      }

      // Tìm review
      const review = await Review.findById(reviewId).session(session);

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Cập nhật trạng thái kiểm duyệt
      review.moderation = {
        status: action === 'approve' ? 'approved' : 'rejected',
        moderatedBy: adminId,
        moderatedAt: new Date(),
        reason: action === 'reject' ? reason : undefined,
      };

      // Nếu từ chối, ẩn review
      if (action === 'reject') {
        review.isVisible = false;
      }

      // Lưu review
      await review.save({ session });

      // Cập nhật tổng rating cho sản phẩm
      await this.updateProductRating(review.product, session);

      await session.commitTransaction();
      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async voteReview(reviewId, userId, vote) {
    // Validate vote
    if (![1, -1].includes(vote)) {
      throw new ApiError(400, 'Invalid vote value');
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Kiểm tra xem người dùng đã vote chưa
    const voterIndex = review.helpfulness.voters.findIndex(
      (voter) => voter.user.toString() === userId.toString()
    );

    if (voterIndex > -1) {
      const previousVote = review.helpfulness.voters[voterIndex].vote;

      // Nếu vote trùng với vote cũ, xóa vote
      if (previousVote === vote) {
        // Cập nhật upvotes/downvotes
        if (vote === 1) {
          review.helpfulness.upvotes--;
        } else {
          review.helpfulness.downvotes--;
        }

        // Xóa voter
        review.helpfulness.voters.splice(voterIndex, 1);
      } else {
        // Nếu vote khác với vote cũ, cập nhật vote
        review.helpfulness.voters[voterIndex].vote = vote;
        review.helpfulness.voters[voterIndex].votedAt = new Date();

        // Cập nhật upvotes/downvotes
        if (vote === 1) {
          review.helpfulness.upvotes++;
          review.helpfulness.downvotes--;
        } else {
          review.helpfulness.upvotes--;
          review.helpfulness.downvotes++;
        }
      }
    } else {
      // Nếu chưa vote, thêm vote mới
      review.helpfulness.voters.push({
        user: userId,
        vote,
        votedAt: new Date(),
      });

      // Cập nhật upvotes/downvotes
      if (vote === 1) {
        review.helpfulness.upvotes++;
      } else {
        review.helpfulness.downvotes++;
      }
    }

    return await review.save();
  }

  async addResponse(reviewId, userId, content, isAdmin = false) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    review.responses.push({
      user: userId,
      isAdmin,
      content,
      createdAt: new Date(),
    });

    return await review.save();
  }

  async getRatingDistribution(productId) {
    return await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          'moderation.status': 'approved',
          isVisible: true,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          rating: '$_id',
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { rating: -1 },
      },
    ]);
  }
}

module.exports = new ReviewRepository();
// module.exports = ReviewRepository;
