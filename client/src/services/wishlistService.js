// services/wishlistService.js
import api from './api';

/**
 * Service for wishlist-related API calls
 */
const wishlistService = {
  /**
   * Get all wishlist items
   * @returns {Promise<Array>} List of wishlist items
   */
  async getWishlist() {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  /**
   * Add product to wishlist
   * @param {string} productId - Product ID to add to wishlist
   * @returns {Promise<Object>} Added wishlist item or success message
   */
  async addToWishlist(productId) {
    try {
      const response = await api.post('/wishlist', { productId });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Remove product from wishlist
   * @param {string} productId - Product ID to remove from wishlist
   * @returns {Promise<Object>} Success message
   */
  async removeFromWishlist(productId) {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  /**
   * Check if product is in wishlist
   * @param {string} productId - Product ID to check
   * @returns {Promise<boolean>} True if product is in wishlist
   */
  async checkInWishlist(productId) {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data.inWishlist;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      throw error;
    }
  },

  /**
   * Clear entire wishlist
   * @returns {Promise<Object>} Success message
   */
  async clearWishlist() {
    try {
      const response = await api.delete('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  },

  /**
   * Move all wishlist items to cart
   * @returns {Promise<Object>} Success message and cart information
   */
  async moveAllToCart() {
    try {
      const response = await api.post('/wishlist/move-to-cart');
      return response.data;
    } catch (error) {
      console.error('Error moving wishlist to cart:', error);
      throw error;
    }
  },

  /**
   * Move a single wishlist item to cart
   * @param {string} productId - Product ID to move to cart
   * @returns {Promise<Object>} Success message and cart information
   */
  async moveToCart(productId) {
    try {
      const response = await api.post(`/wishlist/move-to-cart/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error moving item to cart:', error);
      throw error;
    }
  },
};

export default wishlistService;
