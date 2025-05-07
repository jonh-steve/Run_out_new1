// src/services/orderService.js
import api from './api';

export const orderService = {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng của người dùng
  async getUserOrders() {
    try {
      const response = await api.get('/orders');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết đơn hàng
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  // Hủy đơn hàng
  async cancelOrder(orderId) {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  },
};
