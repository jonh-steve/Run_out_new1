// src/services/paymentService.js
// File này chứa các dịch vụ liên quan đến thanh toán trong ứng dụng
// Hỗ trợ nhiều cổng thanh toán như VNPay, Momo, v.v.

import api from './api';

const paymentService = {
  // === VNPay Payment Methods ===

  // Tạo URL thanh toán VNPay
  createVnpayPaymentUrl: async (orderId, amount, orderInfo) => {
    try {
      const response = await api.post('/payments/vnpay/create-payment-url', {
        orderId,
        amount,
        orderInfo,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay payment URL:', error);
      throw error;
    }
  },

  // Xác thực kết quả thanh toán từ VNPay
  verifyVnpayReturn: async (vnpParams) => {
    try {
      const response = await api.post('/payments/vnpay/verify-return', vnpParams);
      return response.data;
    } catch (error) {
      console.error('Error verifying VNPay return:', error);
      throw error;
    }
  },

  // === Momo Payment Methods ===

  // Tạo URL thanh toán Momo
  createMomoPaymentUrl: async (orderId, amount, orderInfo) => {
    try {
      const response = await api.post('/payments/momo/create-payment-url', {
        orderId,
        amount,
        orderInfo,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Momo payment URL:', error);
      throw error;
    }
  },

  // Xác thực kết quả thanh toán từ Momo
  verifyMomoReturn: async (momoParams) => {
    try {
      const response = await api.post('/payments/momo/verify-return', momoParams);
      return response.data;
    } catch (error) {
      console.error('Error verifying Momo return:', error);
      throw error;
    }
  },

  // === Generic Payment Methods ===

  // Lấy lịch sử thanh toán của người dùng hiện tại
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Lấy chi tiết một giao dịch thanh toán
  getPaymentDetail: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      throw error;
    }
  },

  // Hủy một giao dịch thanh toán
  cancelPayment: async (paymentId, reason) => {
    try {
      const response = await api.post(`/payments/${paymentId}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  },
};

export default paymentService;
