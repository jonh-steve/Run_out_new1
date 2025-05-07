// src/services/reviewService.js
import api from './api';

export const reviewService = {
  // Lấy đánh giá của sản phẩm
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Tạo đánh giá mới
  async createReview(reviewData) {
    try {
      const response = await api.post(`/products/${reviewData.productId}/reviews`, reviewData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Lấy đánh giá của người dùng
  async getUserReviews() {
    try {
      const response = await api.get('/reviews/user');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  // Cập nhật đánh giá
  async updateReview(reviewId, reviewData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  },

  // Xóa đánh giá
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  },
};
