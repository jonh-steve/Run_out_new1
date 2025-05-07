import { createSlice } from '@reduxjs/toolkit';

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
};

// Initial state
const initialState = {
  sidebarOpen: false,
  notifications: [],
  theme: safeLocalStorage.getItem('theme', 'light'),
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      safeLocalStorage.setItem('theme', action.payload);
    },
  },
});

// Actions
export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectNotifications = (state) => state.ui.notifications;
export const selectTheme = (state) => state.ui.theme;

// Middleware để xử lý side effects (như thay đổi DOM)
export const uiMiddleware = (store) => (next) => (action) => {
  // Xử lý trước khi action được dispatch
  const result = next(action);

  // Xử lý sau khi action đã được dispatch
  if (setTheme.match(action)) {
    // Áp dụng theme vào document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(action.payload);
  }

  return result;
};

// Reducer
export default uiSlice.reducer;
