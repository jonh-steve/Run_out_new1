/**
 * Review Service
 * Xử lý logic nghiệp vụ cho đánh giá sản phẩm
 */

const { ApiError } = require('../../common/errors/apiError');
const reviewRepository = require('../../data/repositories/reviewRepository');
const productRepository = require('../../data/repositories/productRepository');
const orderRepository = require('../../data/repositories/orderRepository');
const userRepository = require('../../data/repositories/userRepository');

/**
 * Lấy tất cả đánh giá (có thể lọc, sắp xếp, phân trang)
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Object>} Danh sách đánh giá và thông tin phân trang
 */
const getAllReviews = async (features = {}) => {
  return await reviewRepository.findAll(features);
};

/**
 * Lấy đánh giá theo ID
 * @param {string} id - ID của đánh giá
 * @returns {Promise<Object>} Thông tin đánh giá
 * @throws {ApiError} Nếu không tìm thấy đánh giá
 */
const getReviewById = async (id) => {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new ApiError(404, 'Không tìm thấy đánh giá');
  }
  return review;
};

/**
 * Lấy tất cả đánh giá cho một sản phẩm
 * @param {string} productId - ID của sản phẩm
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Object>} Danh sách đánh giá và thông tin phân trang
 */
const getProductReviews = async (productId, features = {}) => {
  // Kiểm tra sản phẩm tồn tại
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
  }

  // Thêm filter cho product vào features
  const productFilter = { ...features };
  productFilter.filter = {
    ...productFilter.filter,
    product: productId,
    'moderation.status': 'approved',
    isVisible: true,
  };

  return await reviewRepository.findAll(productFilter);
};

/**
 * Lấy tất cả đánh giá của một người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Object>} Danh sách đánh giá và thông tin phân trang
 */
const getUserReviews = async (userId, features = {}) => {
  // Kiểm tra người dùng tồn tại
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  // Thêm filter cho user vào features
  const userFilter = { ...features };
  userFilter.filter = {
    ...userFilter.filter,
    user: userId,
  };

  return await reviewRepository.findAll(userFilter);
};

/**
 * Tạo đánh giá mới
 * @param {string} productId - ID của sản phẩm
 * @param {string} userId - ID của người dùng đánh giá
 * @param {Object} reviewData - Dữ liệu đánh giá
 * @returns {Promise<Object>} Đánh giá đã tạo
 * @throws {ApiError} Nếu có lỗi khi tạo đánh giá
 */
const createReview = async (productId, userId, reviewData) => {
  // Kiểm tra sản phẩm tồn tại
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
  }

  // Kiểm tra người dùng tồn tại
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
  const existingReview = await reviewRepository.findOne({
    product: productId,
    user: userId,
  });

  if (existingReview) {
    throw new ApiError(400, 'Bạn đã đánh giá sản phẩm này rồi');
  }

  // Kiểm tra xem người dùng đã mua sản phẩm này chưa
  const verificationResult = await verifyPurchase(userId, productId);

  // Khởi tạo đánh giá
  const newReview = {
    product: productId,
    user: userId,
    rating: reviewData.rating,
    title: reviewData.title,
    review: reviewData.review,
    images: reviewData.images || [],
    isVerifiedPurchase: verificationResult.isVerified,
    ratings: {
      average: 0,
      count: 0,
    },
  };

  // Nếu có đơn hàng và là mua hàng đã xác minh, thêm thông tin đơn hàng
  if (verificationResult.isVerified && verificationResult.orderId) {
    newReview.order = verificationResult.orderId;
    newReview.purchaseDate = verificationResult.purchaseDate;
  }

  // Kiểm tra nếu cần kiểm duyệt
  const needModeration = process.env.REVIEW_MODERATION_ENABLED === 'true';
  if (needModeration) {
    newReview.moderation = {
      status: 'pending',
      moderatedAt: null,
      moderatedBy: null,
      reason: null,
    };
    newReview.isVisible = false;
  } else {
    newReview.moderation = {
      status: 'approved',
      moderatedAt: new Date(),
      moderatedBy: null,
      reason: null,
    };
    newReview.isVisible = true;
  }

  // Tạo đánh giá mới
  const createdReview = await reviewRepository.create(newReview);

  // Nếu không cần kiểm duyệt, cập nhật rating của sản phẩm
  if (!needModeration) {
    await updateProductRating(productId);
  }

  return createdReview;
};

/**
 * Cập nhật đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} userId - ID của người dùng yêu cầu cập nhật
 * @param {Object} reviewData - Dữ liệu cập nhật
 * @param {boolean} isAdmin - Người dùng có phải admin không
 * @returns {Promise<Object>} Đánh giá đã cập nhật
 * @throws {ApiError} Nếu không tìm thấy đánh giá hoặc không có quyền
 */
const updateReview = async (id, userId, reviewData, isAdmin) => {
  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Kiểm tra quyền cập nhật
  if (!isAdmin && review.user.toString() !== userId) {
    throw new ApiError(403, 'Bạn không có quyền cập nhật đánh giá này');
  }

  // Dữ liệu cần cập nhật
  const updateData = {};

  // Chỉ cập nhật các trường được phép
  if (reviewData.rating !== undefined) updateData.rating = reviewData.rating;
  if (reviewData.title !== undefined) updateData.title = reviewData.title;
  if (reviewData.review !== undefined) updateData.review = reviewData.review;
  if (reviewData.images !== undefined) updateData.images = reviewData.images;

  // Cập nhật thời gian
  updateData.updatedAt = new Date();

  // Nếu cần kiểm duyệt, đưa về trạng thái chờ kiểm duyệt lại
  const needModeration = process.env.REVIEW_MODERATION_ENABLED === 'true';
  if (needModeration && !isAdmin) {
    updateData.moderation = {
      status: 'pending',
      moderatedAt: null,
      moderatedBy: null,
      reason: null,
    };
    updateData.isVisible = false;
  }

  // Cập nhật đánh giá
  const updatedReview = await reviewRepository.update(id, updateData);

  // Nếu không cần kiểm duyệt hoặc là admin, cập nhật rating của sản phẩm
  if (!needModeration || isAdmin) {
    await updateProductRating(review.product);
  }

  return updatedReview;
};

/**
 * Xóa đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} userId - ID của người dùng yêu cầu xóa
 * @param {boolean} isAdmin - Người dùng có phải admin không
 * @returns {Promise<void>}
 * @throws {ApiError} Nếu không tìm thấy đánh giá hoặc không có quyền
 */
const deleteReview = async (id, userId, isAdmin) => {
  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Kiểm tra quyền xóa
  if (!isAdmin && review.user.toString() !== userId) {
    throw new ApiError(403, 'Bạn không có quyền xóa đánh giá này');
  }

  // Lưu ID sản phẩm để cập nhật rating sau
  const productId = review.product;

  // Xóa đánh giá
  await reviewRepository.delete(id);

  // Cập nhật rating của sản phẩm
  await updateProductRating(productId);
};

/**
 * Vote (upvote/downvote) đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} userId - ID của người dùng vote
 * @param {number} vote - Loại vote (1: upvote, -1: downvote)
 * @returns {Promise<Object>} Đánh giá đã cập nhật
 * @throws {ApiError} Nếu không tìm thấy đánh giá
 */
const voteReview = async (id, userId, vote) => {
  // Kiểm tra vote hợp lệ
  if (vote !== 1 && vote !== -1) {
    throw new ApiError(400, 'Vote không hợp lệ');
  }

  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Người dùng không thể vote đánh giá của chính mình
  if (review.user.toString() === userId) {
    throw new ApiError(400, 'Bạn không thể vote đánh giá của chính mình');
  }

  // Kiểm tra xem người dùng đã vote chưa
  const existingVoteIndex = review.helpfulness.voters.findIndex(
    (voter) => voter.user.toString() === userId
  );

  // Nếu đã vote, cập nhật vote
  if (existingVoteIndex > -1) {
    const existingVote = review.helpfulness.voters[existingVoteIndex];

    // Nếu vote giống nhau, hủy vote
    if (existingVote.vote === vote) {
      // Cập nhật số lượng upvote/downvote
      if (vote === 1) {
        review.helpfulness.upvotes -= 1;
      } else {
        review.helpfulness.downvotes -= 1;
      }

      // Xóa vote khỏi danh sách
      review.helpfulness.voters.splice(existingVoteIndex, 1);
    }
    // Nếu vote khác nhau, cập nhật vote
    else {
      // Cập nhật số lượng upvote/downvote
      if (vote === 1) {
        review.helpfulness.upvotes += 1;
        review.helpfulness.downvotes -= 1;
      } else {
        review.helpfulness.upvotes -= 1;
        review.helpfulness.downvotes += 1;
      }

      // Cập nhật vote
      review.helpfulness.voters[existingVoteIndex] = {
        user: userId,
        vote: vote,
        votedAt: new Date(),
      };
    }
  }
  // Nếu chưa vote, thêm vote mới
  else {
    // Cập nhật số lượng upvote/downvote
    if (vote === 1) {
      review.helpfulness.upvotes += 1;
    } else {
      review.helpfulness.downvotes += 1;
    }

    // Thêm vote mới
    review.helpfulness.voters.push({
      user: userId,
      vote: vote,
      votedAt: new Date(),
    });
  }

  // Cập nhật đánh giá
  return await reviewRepository.update(review._id, {
    helpfulness: review.helpfulness,
  });
};

/**
 * Kiểm duyệt đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} action - Hành động (approve/reject)
 * @param {string} reason - Lý do từ chối (nếu reject)
 * @param {string} adminId - ID của admin thực hiện kiểm duyệt
 * @returns {Promise<Object>} Đánh giá đã kiểm duyệt
 * @throws {ApiError} Nếu không tìm thấy đánh giá hoặc action không hợp lệ
 */
const moderateReview = async (id, action, reason, adminId) => {
  // Kiểm tra action hợp lệ
  if (action !== 'approve' && action !== 'reject') {
    throw new ApiError(400, 'Action không hợp lệ');
  }

  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Kiểm tra nếu đã kiểm duyệt với cùng action
  if (review.moderation.status === action) {
    throw new ApiError(400, `Đánh giá đã được ${action === 'approve' ? 'duyệt' : 'từ chối'} rồi`);
  }

  // Dữ liệu cập nhật
  const updateData = {
    moderation: {
      status: action,
      moderatedAt: new Date(),
      moderatedBy: adminId,
      reason: action === 'reject' ? reason : null,
    },
    isVisible: action === 'approve',
  };

  // Cập nhật đánh giá
  const moderatedReview = await reviewRepository.update(id, updateData);

  // Cập nhật rating của sản phẩm
  await updateProductRating(review.product);

  return moderatedReview;
};

/**
 * Báo cáo đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} userId - ID của người dùng báo cáo
 * @param {string} reason - Lý do báo cáo
 * @param {string} description - Mô tả chi tiết
 * @returns {Promise<Object>} Đánh giá đã báo cáo
 * @throws {ApiError} Nếu không tìm thấy đánh giá hoặc đã báo cáo
 */
const reportReview = async (id, userId, reason, description) => {
  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Kiểm tra người dùng đã báo cáo chưa
  const alreadyReported = review.reports.some((report) => report.user.toString() === userId);

  if (alreadyReported) {
    throw new ApiError(400, 'Bạn đã báo cáo đánh giá này rồi');
  }

  // Thêm báo cáo mới
  const newReport = {
    user: userId,
    reason,
    description,
    createdAt: new Date(),
    status: 'pending',
  };

  review.reports.push(newReport);

  // Nếu có quá nhiều báo cáo, tự động ẩn đánh giá chờ kiểm duyệt
  if (review.reports.length >= 3 && review.isVisible) {
    review.isVisible = false;
    review.moderation.status = 'pending';
  }

  // Cập nhật đánh giá
  return await reviewRepository.update(review._id, {
    reports: review.reports,
    isVisible: review.isVisible,
    moderation: review.moderation,
  });
};

/**
 * Thêm phản hồi cho đánh giá
 * @param {string} id - ID của đánh giá
 * @param {string} userId - ID của người dùng thêm phản hồi
 * @param {string} content - Nội dung phản hồi
 * @param {boolean} isAdmin - Người dùng có phải admin không
 * @returns {Promise<Object>} Đánh giá đã thêm phản hồi
 * @throws {ApiError} Nếu không tìm thấy đánh giá
 */
const addReviewResponse = async (id, userId, content, isAdmin) => {
  // Lấy đánh giá theo ID
  const review = await getReviewById(id);

  // Thêm phản hồi mới
  const newResponse = {
    user: userId,
    isAdmin,
    content,
    createdAt: new Date(),
  };

  // Nếu chưa có phản hồi, khởi tạo mảng
  if (!review.responses) {
    review.responses = [];
  }

  review.responses.push(newResponse);

  // Cập nhật đánh giá
  return await reviewRepository.update(review._id, {
    responses: review.responses,
  });
};

/**
 * Kiểm tra xem người dùng đã mua sản phẩm hay chưa
 * @param {string} userId - ID của người dùng
 * @param {string} productId - ID của sản phẩm
 * @returns {Promise<Object>} Kết quả xác minh
 */
const verifyPurchase = async (userId, productId) => {
  // Tìm đơn hàng đã hoàn thành chứa sản phẩm
  const orders = await orderRepository.find({
    user: userId,
    status: { $in: ['delivered', 'completed'] },
    'items.product': productId,
  });

  if (!orders || orders.length === 0) {
    return { isVerified: false };
  }

  // Sắp xếp theo thời gian để lấy đơn hàng gần nhất
  orders.sort((a, b) => b.createdAt - a.createdAt);
  const latestOrder = orders[0];

  return {
    isVerified: true,
    orderId: latestOrder._id,
    purchaseDate: latestOrder.createdAt,
  };
};

/**
 * Cập nhật rating trung bình của sản phẩm
 * @param {string} productId - ID của sản phẩm
 * @returns {Promise<void>}
 */
const updateProductRating = async (productId) => {
  // Lấy tất cả đánh giá đã được phê duyệt và hiển thị
  const reviews = await reviewRepository.find({
    product: productId,
    'moderation.status': 'approved',
    isVisible: true,
  });

  // Nếu không có đánh giá, đặt rating về 0
  if (!reviews || reviews.length === 0) {
    await productRepository.update(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
    return;
  }

  // Tính rating trung bình
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Number((totalRating / reviews.length).toFixed(1));

  // Cập nhật sản phẩm
  await productRepository.update(productId, {
    'ratings.average': averageRating,
    'ratings.count': reviews.length,
  });
};

module.exports = {
  getAllReviews,
  getReviewById,
  getProductReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  voteReview,
  moderateReview,
  reportReview,
  addReviewResponse,
  verifyPurchase,
  updateProductRating,
};
