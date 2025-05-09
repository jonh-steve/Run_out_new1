import axios from 'axios';
// client/src/utils/authToken.js
/**
 * File này chứa các tiện ích để quản lý token xác thực trong ứng dụng React
 * Vị trí: client/src/utils/authToken.js
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Thiết lập token xác thực vào localStorage và header của Axios
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);

  if (token) {
    // Áp dụng token cho tất cả các request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Xóa header nếu không có token
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Lấy token xác thực từ localStorage
 * @returns {string|null} Token xác thực hoặc null nếu không có
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Xóa token xác thực khỏi localStorage và header của Axios
 */
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Thiết lập refresh token vào localStorage
 * @param {string} token - Refresh token
 */
export const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Lấy refresh token từ localStorage
 * @returns {string|null} Refresh token hoặc null nếu không có
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Xóa refresh token khỏi localStorage
 */
export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Làm mới token xác thực bằng refresh token
 * @returns {Promise<string>} Token xác thực mới
 * @throws {Error} Nếu không thể làm mới token
 */
export const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Không thể làm mới token');
    }

    const data = await response.json();
    setAuthToken(data.token);

    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }

    return data.token;
  } catch (error) {
    removeAuthToken();
    removeRefreshToken();
    throw error;
  }
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
