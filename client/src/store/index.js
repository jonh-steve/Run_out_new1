import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer, { authMiddleware } from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import uiReducer, { uiMiddleware } from './slices/uiSlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';
import checkoutReducer from './slices/checkoutSlice';
import userReducer from './slices/userSlice';
import wishlistReducer from './slices/wishlistSlice';
import notificationReducer from './slices/notificationSlice';
import { api } from '../services/api';

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

// Middleware tùy chỉnh để ghi log các actions (chỉ trong môi trường development)
const loggerMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

// Middleware để lưu state vào localStorage - đã cải tiến với xử lý lỗi
const persistStateMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  try {
    const stateToPersist = {
      cart: store.getState().cart,
      auth: {
        isAuthenticated: store.getState().auth.isAuthenticated,
        user: store.getState().auth.user,
      },
      wishlist: store.getState().wishlist,
    };
    safeLocalStorage.setItem('reduxState', JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Lỗi khi lưu state vào localStorage:', error);
  }
  return result;
};

// Lấy state từ localStorage khi khởi động - đã cải tiến với safeLocalStorage
const loadState = () => {
  try {
    const serializedState = safeLocalStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Không thể load state từ localStorage:', err);
    return undefined;
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    ui: uiReducer,
    order: orderReducer,
    review: reviewReducer,
    checkout: checkoutReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    notification: notificationReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các actions và paths không serializable
        ignoredActions: [
          'checkout/createOrder/fulfilled',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
        ],
        ignoredPaths: ['checkout.paymentUrl', 'auth.user.token', 'ui.modalContent'],
      },
    }).concat(
      api.middleware,
      loggerMiddleware,
      persistStateMiddleware,
      uiMiddleware, // Thêm middleware cho UI
      authMiddleware // Thêm middleware cho Auth
    ),
  preloadedState,
  devTools: process.env.NODE_ENV !== 'production',
});

// Áp dụng theme ban đầu khi ứng dụng khởi động
const initialTheme = store.getState().ui.theme;
if (initialTheme) {
  document.documentElement.classList.add(initialTheme);
}

// Cấu hình listeners cho RTK Query
setupListeners(store.dispatch);

// Hàm tiện ích để dispatch nhiều actions cùng lúc
export const batchDispatch = (actions) => {
  actions.forEach((action) => store.dispatch(action));
};

// Hàm tiện ích để reset toàn bộ state (ví dụ: khi logout)
export const resetStore = () => {
  // Danh sách các actions để reset từng phần của state
  const resetActions = [
    { type: 'auth/logout' },
    { type: 'cart/clearCart' },
    { type: 'ui/resetUI' },
    { type: 'wishlist/clearWishlist' },
    { type: 'notification/clearAll' },
  ];

  batchDispatch(resetActions);
  safeLocalStorage.removeItem('reduxState');
};

// Hooks typing
export * from './hooks';
