// src/services/paymentService.js
import api from './api';

export const paymentService = {
  // Tạo payment URL cho VNPay
  async createPaymentUrl(orderId) {
    try {
      const response = await api.post(`/payments/create-payment-url`, { orderId });
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment URL:', error);
      throw error;
    }
  },

  // Xác nhận kết quả thanh toán sau khi redirect từ VNPay
  async verifyPayment(paymentData) {
    try {
      const response = await api.post('/payments/verify', paymentData);
      return response.data.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Lấy lịch sử thanh toán
  async getPaymentHistory() {
    try {
      const response = await api.get('/payments/history');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },
};
