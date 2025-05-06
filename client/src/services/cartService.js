import axios from 'axios';
import { api } from './api';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CART_URL = `${API_URL}/cart`;

// Cart API endpoints
export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: '/cart',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/cart/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

// Export hooks
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;

// Regular API service for use with Redux Thunk
const cartService = {
  // Lấy giỏ hàng
  getCart: async () => {
    return await axios.get(CART_URL);
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (item) => {
    return await axios.post(CART_URL, item);
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (productId, quantity) => {
    return await axios.put(`${CART_URL}/${productId}`, { quantity });
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId) => {
    return await axios.delete(`${CART_URL}/${productId}`);
  },

  // Xóa giỏ hàng
  clearCart: async () => {
    return await axios.delete(CART_URL);
  },

  // Áp dụng mã giảm giá
  applyCoupon: async (couponCode) => {
    return await axios.post(`${CART_URL}/coupon`, { code: couponCode });
  },

  // Xóa mã giảm giá
  removeCoupon: async () => {
    return await axios.delete(`${CART_URL}/coupon`);
  },
};

export default cartService;
