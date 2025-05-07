import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setAuthToken, removeAuthToken } from '../../utils/authToken';

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
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: safeLocalStorage.getItem('token'),
  isAuthenticated: !!safeLocalStorage.getItem('token'),
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Không thao tác với localStorage và removeAuthToken ở đây nữa
    },
    clearError: (state) => {
      state.error = null;
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
        // Không thao tác với localStorage và setAuthToken ở đây nữa
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
        // Không thao tác với localStorage và setAuthToken ở đây nữa
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
        // Nếu token không hợp lệ, đăng xuất người dùng
        if (action.payload === 'Unauthorized' || action.payload === 'Invalid token') {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          // Không thao tác với localStorage và removeAuthToken ở đây nữa
        }
      });
  },
});

// Actions
export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Middleware để xử lý side effects (như localStorage và authToken)
export const authMiddleware = (store) => (next) => (action) => {
  // Xử lý trước khi action được dispatch
  const result = next(action);

  // Xử lý sau khi action đã được dispatch
  if (login.fulfilled.match(action) || register.fulfilled.match(action)) {
    // Lưu token vào localStorage và thiết lập header cho axios
    safeLocalStorage.setItem('token', action.payload.token);
    setAuthToken(action.payload.token);
  } else if (
    logout.match(action) ||
    (fetchCurrentUser.rejected.match(action) &&
      (action.payload === 'Unauthorized' || action.payload === 'Invalid token'))
  ) {
    // Xóa token khỏi localStorage và header
    safeLocalStorage.removeItem('token');
    removeAuthToken();
  }

  return result;
};

// Reducer
export default authSlice.reducer;
