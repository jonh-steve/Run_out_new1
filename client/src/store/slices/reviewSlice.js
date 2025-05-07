// src/store/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../services/reviewService';

export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const result = await reviewService.getProductReviews(productId);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy đánh giá sản phẩm');
    }
  }
);

export const submitProductReview = createAsyncThunk(
  'review/submitProductReview',
  async (reviewData, { rejectWithValue, dispatch }) => {
    try {
      const result = await reviewService.createReview(reviewData);
      // Refetch reviews after submitting
      dispatch(fetchProductReviews(reviewData.productId));
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi đánh giá');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'review/fetchUserReviews',
  async (_, { rejectWithValue }) => {
    try {
      const reviews = await reviewService.getUserReviews();
      return reviews;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy đánh giá của bạn');
    }
  }
);

const initialState = {
  reviews: [],
  userReviews: [],
  stats: {
    average: 0,
    count: 0,
    distribution: {},
  },
  loading: false,
  submitting: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProductReviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = action.payload.stats;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi lấy đánh giá';
      })

      // submitProductReview
      .addCase(submitProductReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitProductReview.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitProductReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Có lỗi xảy ra khi gửi đánh giá';
      })

      // fetchUserReviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi lấy đánh giá của bạn';
      });
  },
});

export default reviewSlice.reducer;
