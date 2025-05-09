// client/src/store/slices/authSlice.js
// File này chứa Redux slice cho việc quản lý xác thực người dùng
// Vị trí: client/src/store/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import {
  setAuthToken,
  removeAuthToken,
  setRefreshToken,
  removeRefreshToken,
  refreshToken as refreshAuthToken,
} from '../../utils/authToken';

// Hàm tiện ích để thao tác với localStorage an toàn
const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error(`Lỗi khi đọc ${key} từ localStorage:`, error);
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Lỗi khi lưu ${key} vào localStorage:`, error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa ${key} từ localStorage:`, error);
      return false;
    }
  },
};

// Async thunks
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
  }
});

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      // Nếu lỗi 401 và có refresh token, thử refresh token
      if (error.response?.status === 401 && safeLocalStorage.getItem('refresh_token')) {
        try {
          await refreshAuthToken();
          // Thử lại yêu cầu ban đầu
          const retryResponse = await authService.getCurrentUser();
          return retryResponse.data;
        } catch (refreshError) {
          // Nếu refresh token thất bại, đăng xuất người dùng
          dispatch(logout());
          return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const newToken = await refreshAuthToken();
      return { token: newToken };
    } catch (error) {
      return rejectWithValue('Không thể làm mới token');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: safeLocalStorage.getItem('token'),
  refreshToken: safeLocalStorage.getItem('refresh_token'),
  isAuthenticated: !!safeLocalStorage.getItem('token'),
  loading: false,
  error: null,
  successMessage: null,
  passwordResetRequested: false,
  passwordResetSuccess: false,
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.successMessage = null;
      // Không thao tác với localStorage và removeAuthToken ở đây nữa
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
      state.passwordResetRequested = false;
      state.passwordResetSuccess = false;
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.successMessage = 'Đăng nhập thành công';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.successMessage = 'Đăng ký thành công';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Nếu token không hợp lệ, đăng xuất người dùng được xử lý trong thunk
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetRequested = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetRequested = true;
        state.successMessage = 'Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
        state.successMessage = 'Mật khẩu đã được đặt lại thành công';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.profileUpdateSuccess = true;
        state.successMessage = 'Cập nhật thông tin thành công';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChangeSuccess = true;
        state.successMessage = 'Đổi mật khẩu thành công';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(refreshUserToken.rejected, (state) => {
        // Nếu refresh token thất bại, đăng xuất người dùng
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

// Actions
export const { logout, clearError, clearSuccess, setUser } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMessage;
export const selectPasswordResetRequested = (state) => state.auth.passwordResetRequested;
export const selectPasswordResetSuccess = (state) => state.auth.passwordResetSuccess;
export const selectProfileUpdateSuccess = (state) => state.auth.profileUpdateSuccess;
export const selectPasswordChangeSuccess = (state) => state.auth.passwordChangeSuccess;
export const selectUserRole = (state) => state.auth.user?.role || 'guest';
export const selectUserPermissions = (state) => state.auth.user?.permissions || [];
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

// Middleware để xử lý side effects (như localStorage và authToken)
export const authMiddleware = (store) => (next) => (action) => {
  // Xử lý trước khi action được dispatch
  const result = next(action);

  // Xử lý sau khi action đã được dispatch
  if (login.fulfilled.match(action) || register.fulfilled.match(action)) {
    // Lưu token vào localStorage và thiết lập header cho axios
    safeLocalStorage.setItem('token', action.payload.token);
    setAuthToken(action.payload.token);

    // Lưu refresh token nếu có
    if (action.payload.refreshToken) {
      safeLocalStorage.setItem('refresh_token', action.payload.refreshToken);
      setRefreshToken(action.payload.refreshToken);
    }
  } else if (refreshUserToken.fulfilled.match(action)) {
    // Cập nhật token mới
    safeLocalStorage.setItem('token', action.payload.token);
    setAuthToken(action.payload.token);

    // Cập nhật refresh token nếu có
    if (action.payload.refreshToken) {
      safeLocalStorage.setItem('refresh_token', action.payload.refreshToken);
      setRefreshToken(action.payload.refreshToken);
    }
  } else if (
    logout.match(action) ||
    refreshUserToken.rejected.match(action) ||
    (fetchCurrentUser.rejected.match(action) &&
      (action.payload === 'Unauthorized' ||
        action.payload === 'Invalid token' ||
        action.payload === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'))
  ) {
    // Xóa token khỏi localStorage và header
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('refresh_token');
    removeAuthToken();
    removeRefreshToken();
  }

  return result;
};

// Reducer
export default authSlice.reducer;
