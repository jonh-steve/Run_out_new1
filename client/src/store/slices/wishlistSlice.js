// src/store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';

// Async thunk để lấy danh sách sản phẩm yêu thích
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.getWishlist();
      return wishlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách yêu thích');
    }
  }
);

// Async thunk để thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const result = await wishlistService.addToWishlist(productId);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể thêm vào danh sách yêu thích'
      );
    }
  }
);

// Async thunk để xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa khỏi danh sách yêu thích'
      );
    }
  }
);

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  addingItem: null,
  removingItem: null,
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Reset trạng thái lỗi
    resetWishlistError: (state) => {
      state.error = null;
    },
    // Clear toàn bộ danh sách yêu thích khi logout
    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.addingItem = null;
      state.removingItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi lấy danh sách yêu thích';
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state, action) => {
        state.addingItem = action.meta.arg; // productId
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.addingItem = null;
        // Kiểm tra xem sản phẩm đã có trong danh sách chưa
        const exists = state.items.some((item) => item._id === action.payload._id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.addingItem = null;
        state.error = action.payload || 'Đã xảy ra lỗi khi thêm vào danh sách yêu thích';
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.removingItem = action.meta.arg; // productId
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.removingItem = null;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.removingItem = null;
        state.error = action.payload || 'Đã xảy ra lỗi khi xóa khỏi danh sách yêu thích';
      });
  },
});

// Export actions
export const { resetWishlistError, clearWishlist } = wishlistSlice.actions;

// Export reducer
export default wishlistSlice.reducer;
