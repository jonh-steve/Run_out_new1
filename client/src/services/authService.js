// File: client/src/services/authService.js
// Dịch vụ xác thực người dùng trong ứng dụng client

import axios from 'axios';
import { api } from './api';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_URL = `${API_URL}/auth`;

// Auth API endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
} = authApi;

// Utility để quản lý token
const authToken = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },
};

// Regular API service for use with Redux Thunk
const authService = {
  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await axios.post(`${AUTH_URL}/login`, credentials);

      // Lưu token vào localStorage nếu có
      if (response.data.token) {
        authToken.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      const response = await axios.post(`${AUTH_URL}/register`, userData);

      // Lưu token vào localStorage nếu có
      if (response.data.token) {
        authToken.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data || error.message);
      throw error;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      return await axios.post(`${AUTH_URL}/forgot-password`, { email });
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      throw error;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, password) => {
    try {
      return await axios.post(`${AUTH_URL}/reset-password`, { token, password });
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error);
      throw error;
    }
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    try {
      const token = authToken.getToken();
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      return await axios.get(`${AUTH_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData) => {
    try {
      const token = authToken.getToken();
      return await axios.put(`${API_URL}/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const token = authToken.getToken();
      return await axios.put(`${API_URL}/users/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    authToken.removeToken();
  },
};

export default authService;
