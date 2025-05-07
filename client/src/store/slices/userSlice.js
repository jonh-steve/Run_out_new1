// src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Async thunk để lấy thông tin hồ sơ người dùng
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getUserProfile();
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

// Async thunk để cập nhật thông tin hồ sơ người dùng
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.updateUserProfile(userData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể cập nhật thông tin người dùng'
      );
    }
  }
);

// Async thunk để thay đổi mật khẩu
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const result = await userService.changePassword(passwordData);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi mật khẩu');
    }
  }
);

// Async thunk để cập nhật avatar
export const updateAvatar = createAsyncThunk(
  'user/updateAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const result = await userService.updateAvatar(formData);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật ảnh đại diện');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
  passwordUpdateStatus: {
    loading: false,
    success: false,
    error: null,
  },
  avatarUpdateStatus: {
    loading: false,
    success: false,
    error: null,
  },
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reset trạng thái cập nhật mật khẩu
    resetPasswordUpdateStatus: (state) => {
      state.passwordUpdateStatus = {
        loading: false,
        success: false,
        error: null,
      };
    },
    // Reset trạng thái cập nhật avatar
    resetAvatarUpdateStatus: (state) => {
      state.avatarUpdateStatus = {
        loading: false,
        success: false,
        error: null,
      };
    },
    // Clear user state khi logout
    clearUserState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.passwordUpdateStatus = {
        loading: false,
        success: false,
        error: null,
      };
      state.avatarUpdateStatus = {
        loading: false,
        success: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi lấy thông tin người dùng';
      })

      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi cập nhật thông tin người dùng';
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.passwordUpdateStatus.loading = true;
        state.passwordUpdateStatus.success = false;
        state.passwordUpdateStatus.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordUpdateStatus.loading = false;
        state.passwordUpdateStatus.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordUpdateStatus.loading = false;
        state.passwordUpdateStatus.success = false;
        state.passwordUpdateStatus.error = action.payload || 'Đã xảy ra lỗi khi thay đổi mật khẩu';
      })

      // updateAvatar
      .addCase(updateAvatar.pending, (state) => {
        state.avatarUpdateStatus.loading = true;
        state.avatarUpdateStatus.success = false;
        state.avatarUpdateStatus.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.avatarUpdateStatus.loading = false;
        state.avatarUpdateStatus.success = true;
        if (state.user) {
          state.user.avatar = action.payload.avatar;
        }
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.avatarUpdateStatus.loading = false;
        state.avatarUpdateStatus.success = false;
        state.avatarUpdateStatus.error =
          action.payload || 'Đã xảy ra lỗi khi cập nhật ảnh đại diện';
      });
  },
});

// Export actions
export const { resetPasswordUpdateStatus, resetAvatarUpdateStatus, clearUserState } =
  userSlice.actions;

// Export reducer
export default userSlice.reducer;
