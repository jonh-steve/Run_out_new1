// src/store/slices/checkoutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const createOrder = createAsyncThunk(
  'checkout/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const result = await orderService.createOrder(orderData);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  paymentUrl: null,
  orderId: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckoutState: (state) => {
      state.loading = false;
      state.error = null;
      state.paymentUrl = null;
      state.orderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload.paymentUrl;
        state.orderId = action.payload.orderId;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi tạo đơn hàng';
      });
  },
});

export const { clearCheckoutState } = checkoutSlice.actions;
export default checkoutSlice.reducer;
