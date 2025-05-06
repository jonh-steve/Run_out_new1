import axios from 'axios';
// client/src/utils/authToken.js
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
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

export const isAuthenticated = () => {
  return !!getAuthToken();
};
/**
 * Thiết lập token vào header của Axios
 * @param {string} token - JWT token
 */
// export const setAuthToken = (token) => {
//   if (token) {
//     // Áp dụng token cho tất cả các request
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     // Xóa header nếu không có token
//     delete axios.defaults.headers.common['Authorization'];
//   }
// };

// /**
//  * Xóa token khỏi header của Axios
//  */
// export const removeAuthToken = () => {
//   delete axios.defaults.headers.common['Authorization'];
// };
