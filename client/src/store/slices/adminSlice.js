// src/store/slices/adminSlice.js
// File này nằm trong thư mục src/store/slices của dự án React Redux

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// Async thunk actions
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboardStats();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thống kê dashboard');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'admin/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getRecentOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy đơn hàng gần đây');
    }
  }
);

export const fetchSalesData = createAsyncThunk(
  'admin/fetchSalesData',
  async (period, { rejectWithValue }) => {
    try {
      return await adminService.getSalesData(period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy dữ liệu doanh thu');
    }
  }
);

// Thêm thunk action quản lý sản phẩm
export const fetchProducts = createAsyncThunk(
  'admin/fetchProducts',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      return await adminService.getProducts(page, limit, search);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.createProduct(productData);
      // Sau khi tạo sản phẩm thành công, cập nhật lại danh sách
      dispatch(fetchProducts({ page: 1 }));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo sản phẩm mới');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await adminService.updateProduct(id, productData);
      // Sau khi cập nhật sản phẩm thành công, cập nhật lại danh sách
      const { currentPage } = getState().admin;
      dispatch(fetchProducts({ page: currentPage }));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await adminService.deleteProduct(id);
      // Sau khi xóa sản phẩm thành công, cập nhật lại danh sách
      const { currentPage } = getState().admin;
      dispatch(fetchProducts({ page: currentPage }));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  }
);

// Thêm thunk action quản lý đơn hàng
export const fetchOrders = createAsyncThunk(
  'admin/fetchOrders',
  async ({ page = 1, limit = 10, status = '' }, { rejectWithValue }) => {
    try {
      return await adminService.getOrders(page, limit, status);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await adminService.updateOrderStatus(id, status);
      // Sau khi cập nhật trạng thái đơn hàng, cập nhật lại danh sách
      const { currentPage } = getState().admin;
      dispatch(fetchOrders({ page: currentPage }));
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng'
      );
    }
  }
);

// Thêm thunk action quản lý người dùng
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      return await adminService.getUsers(page, limit, search);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await adminService.updateUserStatus(id, status);
      // Sau khi cập nhật trạng thái người dùng, cập nhật lại danh sách
      const { currentPage } = getState().admin;
      dispatch(fetchUsers({ page: currentPage }));
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi cập nhật trạng thái người dùng'
      );
    }
  }
);

const initialState = {
  stats: null,
  recentOrders: [],
  salesData: [],
  productList: [],
  orderList: [],
  userList: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  isLoadingSales: false,
  isLoadingProducts: false,
  isLoadingOrders: false,
  isLoadingUsers: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Recent Orders
      .addCase(fetchRecentOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentOrders = action.payload;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Sales Data
      .addCase(fetchSalesData.pending, (state) => {
        state.isLoadingSales = true;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.isLoadingSales = false;
        state.salesData = action.payload;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.isLoadingSales = false;
        state.error = action.payload;
      })

      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoadingProducts = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoadingProducts = false;
        state.productList = action.payload.products;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoadingProducts = false;
        state.error = action.payload;
      })

      // Không cần thêm case cho createProduct, updateProduct, deleteProduct
      // vì chúng đã dispatch fetchProducts để cập nhật lại danh sách

      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoadingOrders = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoadingOrders = false;
        state.orderList = action.payload.orders;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoadingOrders = false;
        state.error = action.payload;
      })

      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.userList = action.payload.users;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, clearError } = adminSlice.actions;

export default adminSlice.reducer;
