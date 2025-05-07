/**
 * Review Controller
 * Xử lý các request liên quan đến đánh giá sản phẩm
 */

const catchAsync = require('../../common/utils/catchAsync');
const responseHandler = require('../../common/utils/responseHandler');
const reviewService = require('../../services/review/reviewService');

/**
 * Lấy tất cả đánh giá (có phân trang, lọc)
 * @route GET /api/reviews
 * @access Public
 */
const getAllReviews = catchAsync(async (req, res) => {
  const features = req.query;
  const reviews = await reviewService.getAllReviews(features);
  return responseHandler.success(res, reviews);
});

/**
 * Lấy đánh giá theo ID
 * @route GET /api/reviews/:id
 * @access Public
 */
const getReviewById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const review = await reviewService.getReviewById(id);
  return responseHandler.success(res, review);
});

/**
 * Lấy tất cả đánh giá cho một sản phẩm
 * @route GET /api/products/:productId/reviews
 * @access Public
 */
const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const features = req.query;
  const reviews = await reviewService.getProductReviews(productId, features);
  return responseHandler.success(res, reviews);
});

/**
 * Lấy tất cả đánh giá của một người dùng
 * @route GET /api/users/:userId/reviews
 * @access Private (Admin hoặc người dùng sở hữu đánh giá)
 */
const getUserReviews = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Kiểm tra quyền truy cập
  const requestUserId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (userId !== requestUserId && !isAdmin) {
    return responseHandler.forbidden(res, 'Bạn không có quyền xem đánh giá của người dùng khác');
  }

  const features = req.query;
  const reviews = await reviewService.getUserReviews(userId, features);
  return responseHandler.success(res, reviews);
});

/**
 * Tạo đánh giá mới
 * @route POST /api/products/:productId/reviews
 * @access Private
 */
const createReview = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const reviewData = req.body;

  const newReview = await reviewService.createReview(productId, userId, reviewData);
  return responseHandler.created(res, newReview);
});

/**
 * Cập nhật đánh giá
 * @route PUT /api/reviews/:id
 * @access Private (Người dùng sở hữu đánh giá)
 */
const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const reviewData = req.body;

  const updatedReview = await reviewService.updateReview(id, userId, reviewData, isAdmin);
  return responseHandler.success(res, updatedReview);
});

/**
 * Xóa đánh giá
 * @route DELETE /api/reviews/:id
 * @access Private (Admin hoặc người dùng sở hữu đánh giá)
 */
const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  await reviewService.deleteReview(id, userId, isAdmin);
  return responseHandler.success(res, { message: 'Đánh giá đã được xóa thành công' });
});

/**
 * Upvote hoặc downvote đánh giá
 * @route POST /api/reviews/:id/vote
 * @access Private
 */
const voteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { vote } = req.body; // 1 for upvote, -1 for downvote

  const updatedReview = await reviewService.voteReview(id, userId, vote);
  return responseHandler.success(res, updatedReview);
});

/**
 * Kiểm duyệt đánh giá (duyệt hoặc từ chối)
 * @route PATCH /api/reviews/:id/moderate
 * @access Private (Admin only)
 */
const moderateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { action, reason } = req.body; // 'approve' or 'reject'

  const moderatedReview = await reviewService.moderateReview(id, action, reason, adminId);
  return responseHandler.success(res, moderatedReview);
});

/**
 * Báo cáo đánh giá
 * @route POST /api/reviews/:id/report
 * @access Private
 */
const reportReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason, description } = req.body;

  const reportedReview = await reviewService.reportReview(id, userId, reason, description);
  return responseHandler.success(res, reportedReview);
});

/**
 * Thêm phản hồi cho đánh giá
 * @route POST /api/reviews/:id/responses
 * @access Private (Admin hoặc người dùng sở hữu sản phẩm)
 */
const addReviewResponse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { content } = req.body;

  const updatedReview = await reviewService.addReviewResponse(id, userId, content, isAdmin);
  return responseHandler.success(res, updatedReview);
});

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
};
