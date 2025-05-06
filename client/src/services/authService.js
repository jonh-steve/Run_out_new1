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

// Regular API service for use with Redux Thunk
const authService = {
  // Đăng nhập
  login: async (credentials) => {
    return await axios.post(`${AUTH_URL}/login`, credentials);
  },

  // Đăng ký
  register: async (userData) => {
    return await axios.post(`${AUTH_URL}/register`, userData);
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    return await axios.post(`${AUTH_URL}/forgot-password`, { email });
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, password) => {
    return await axios.post(`${AUTH_URL}/reset-password`, { token, password });
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    return await axios.get(`${AUTH_URL}/me`);
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData) => {
    return await axios.put(`${API_URL}/users/profile`, userData);
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axios.put(`${API_URL}/users/password`, passwordData);
  },
};

export default authService;
