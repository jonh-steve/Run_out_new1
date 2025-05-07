// services/notificationService.js
import api from './api';

/**
 * Service for notification-related API calls
 */
const notificationService = {
  /**
   * Get all notifications for current user
   * @param {Object} params - Query parameters for pagination/filtering
   * @returns {Promise<Object>} Notifications with pagination data
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   * @returns {Promise<number>} Number of unread notifications
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread/count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success message
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>} Success message
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },

  /**
   * Delete all notifications
   * @returns {Promise<Object>} Success message
   */
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Current notification preferences
   */
  async getPreferences() {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  /**
   * Initialize WebSocket connection for real-time notifications
   * @returns {WebSocket} WebSocket connection
   */
  initializeWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return null;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.REACT_APP_WS_HOST || window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications?token=${token}`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established for notifications');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);

        // Attempt to reconnect after 5 seconds if connection was closed unexpectedly
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            this.initializeWebSocket();
          }, 5000);
        }
      };

      return socket;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      return null;
    }
  },
};

export default notificationService;
