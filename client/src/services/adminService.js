// src/services/adminService.js

import api from './api';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Recent Orders
  getRecentOrders: async () => {
    try {
      const response = await api.get('/admin/orders/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // Sales Data
  getSalesData: async (period = 'monthly') => {
    try {
      const response = await api.get(`/admin/dashboard/sales?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  },

  // Product Management
  getProducts: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();

      const response = await api.get(`/admin/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Order Management
  getOrders: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();

      const response = await api.get(`/admin/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // User Management
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};

export default adminService;
