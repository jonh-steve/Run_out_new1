import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { refreshToken } from '../utils/authToken';

// URL cơ sở của API
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Truy vấn cơ sở tùy chỉnh với khả năng làm mới token
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Lấy token từ state
      const token = getState().auth.token;

      // Nếu có token, thêm vào header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  });

  // Thử nghiệm đầu tiên với token hiện tại
  let result = await baseQuery(args, api, extraOptions);

  // Nếu nhận được phản hồi 401 Unauthorized, thử làm mới token
  if (result.error && result.error.status === 401) {
    try {
      // Cố gắng lấy token mới
      const newToken = await refreshToken();

      // Lưu trữ token mới
      api.dispatch({
        type: 'auth/tokenRefreshed',
        payload: newToken,
      });

      // Thử lại truy vấn ban đầu với token mới
      result = await baseQuery(args, api, extraOptions);
    } catch (refreshError) {
      // Xử lý khi làm mới token thất bại - chuyển hướng đến trang đăng nhập
      window.location.href = '/login';
    }
  }

  return result;
};

// RTK Query API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Category', 'User', 'Cart', 'Order', 'Review'],
  endpoints: () => ({}),
});

export default api;
