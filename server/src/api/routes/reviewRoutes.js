/**
 * Review Routes
 * Định nghĩa các routes liên quan đến đánh giá sản phẩm
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Cho phép truy cập params từ parent router
const reviewController = require('../controllers/reviewController');
const { validate } = require('../../common/middleware/validate');
const { reviewValidator } = require('../../common/validators/reviewValidator');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes công khai cho việc đọc đánh giá
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// Routes cần xác thực
router.use(authMiddleware.authenticate);

// Đánh giá hay upvote, downvote một đánh giá
router.post(
  '/:id/vote',
  validate(reviewValidator.voteReview),
  reviewController.voteReview
);

// Báo cáo một đánh giá không phù hợp
router.post(
  '/:id/report',
  validate(reviewValidator.reportReview),
  reviewController.reportReview
);

// Thêm phản hồi cho đánh giá
router.post(
  '/:id/responses',
  validate(reviewValidator.addReviewResponse),
  reviewController.addReviewResponse
);

// Cập nhật hoặc xóa đánh giá (người dùng chỉ có thể chỉnh sửa/xóa đánh giá của chính họ)
router.put(
  '/:id',
  validate(reviewValidator.updateReview),
  reviewController.updateReview
);

router.delete('/:id', reviewController.deleteReview);

// Routes chỉ dành cho admin
router.patch(
  '/:id/moderate',
  authMiddleware.restrictTo('admin'),
  validate(reviewValidator.moderateReview),
  reviewController.moderateReview
);

module.exports = router;