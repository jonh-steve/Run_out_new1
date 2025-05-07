// src/store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

// Async thunk để lấy danh sách thông báo
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getNotifications();
      return notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông báo');
    }
  }
);

// Async thunk để đánh dấu thông báo đã đọc
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc'
      );
    }
  }
);

// Async thunk để đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu tất cả thông báo đã đọc'
      );
    }
  }
);

// Async thunk để xóa thông báo
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa thông báo');
    }
  }
);

// Async thunk để xóa tất cả thông báo
export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.deleteAllNotifications();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa tất cả thông báo');
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  operationInProgress: false,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Thêm thông báo mới (cho realtime notifications)
    addNewNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    // Reset trạng thái lỗi
    resetNotificationError: (state) => {
      state.error = null;
    },
    // Clear notifications khi logout
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.loading = false;
      state.error = null;
      state.operationInProgress = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi lấy thông báo';
      })

      // markAsRead
      .addCase(markAsRead.pending, (state) => {
        state.operationInProgress = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.operationInProgress = false;
        const notification = state.notifications.find((item) => item._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.operationInProgress = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc';
      })

      // markAllAsRead
      .addCase(markAllAsRead.pending, (state) => {
        state.operationInProgress = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.operationInProgress = false;
        state.notifications.forEach((notification) => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.operationInProgress = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi đánh dấu tất cả thông báo đã đọc';
      })

      // deleteNotification
      .addCase(deleteNotification.pending, (state) => {
        state.operationInProgress = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.operationInProgress = false;
        const deletedNotification = state.notifications.find((item) => item._id === action.payload);
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.operationInProgress = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi xóa thông báo';
      })

      // deleteAllNotifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.operationInProgress = true;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.operationInProgress = false;
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.operationInProgress = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi xóa tất cả thông báo';
      });
  },
});

// Export actions
export const { addNewNotification, resetNotificationError, clearNotifications } =
  notificationSlice.actions;

// Export reducer
export default notificationSlice.reducer;
