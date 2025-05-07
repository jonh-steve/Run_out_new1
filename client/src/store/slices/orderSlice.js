// src/store/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getUserOrders();
      return orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'order/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin đơn hàng');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi lấy danh sách đơn hàng';
      })

      // fetchOrderDetail
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Có lỗi xảy ra khi lấy thông tin đơn hàng';
      });
  },
});

export default orderSlice.reducer;
