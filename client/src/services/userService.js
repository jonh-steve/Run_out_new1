// services/userService.js
import api from './api';

/**
 * Service for user-related API calls
 */
const userService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(userData) {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Contains current and new password
   * @returns {Promise<Object>} Success message
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Get user order history
   * @param {Object} params - Query parameters for pagination/filtering
   * @returns {Promise<Array>} List of user orders
   */
  async getOrders(params = {}) {
    try {
      const response = await api.get('/users/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Get specific order details
   * @param {string} orderId - ID of the order
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/users/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order details for order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get user reviews
   * @param {Object} params - Query parameters for pagination/filtering
   * @returns {Promise<Array>} List of user reviews
   */
  async getReviews(params = {}) {
    try {
      const response = await api.get('/users/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  /**
   * Upload user avatar
   * @param {FormData} formData - Form data containing the avatar image
   * @returns {Promise<Object>} Updated user data with new avatar URL
   */
  async uploadAvatar(formData) {
    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Get user shipping addresses
   * @returns {Promise<Array>} List of user addresses
   */
  async getAddresses() {
    try {
      const response = await api.get('/users/addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  /**
   * Add new shipping address
   * @param {Object} addressData - Address information
   * @returns {Promise<Object>} Created address
   */
  async addAddress(addressData) {
    try {
      const response = await api.post('/users/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  /**
   * Update existing shipping address
   * @param {string} addressId - ID of the address
   * @param {Object} addressData - Updated address information
   * @returns {Promise<Object>} Updated address
   */
  async updateAddress(addressId, addressData) {
    try {
      const response = await api.put(`/users/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating address ${addressId}:`, error);
      throw error;
    }
  },

  /**
   * Delete shipping address
   * @param {string} addressId - ID of the address
   * @returns {Promise<Object>} Success message
   */
  async deleteAddress(addressId) {
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting address ${addressId}:`, error);
      throw error;
    }
  },
};

export default userService;
