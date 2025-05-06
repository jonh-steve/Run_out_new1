import axios from 'axios';
import { api } from './api';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PRODUCTS_URL = `${API_URL}/products`;
const CATEGORIES_URL = `${API_URL}/categories`;

// Products API endpoints
export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    getProductReviews: builder.query({
      query: (id) => `/products/${id}/reviews`,
      providesTags: (result, error, id) => [{ type: 'Review', id: `product-${id}` }],
    }),
  }),
});

// Export hooks
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetProductReviewsQuery,
} = productApi;

// Regular API service for use with Redux Thunk
const productService = {
  /**
   * Lấy danh sách sản phẩm
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
   */
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} id - ID sản phẩm
   * @returns {Promise<Object>} Thông tin chi tiết sản phẩm
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categoryId - ID danh mục
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  },

  /**
   * Tìm kiếm sản phẩm
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Kết quả tìm kiếm
   */
  searchProducts: async (query, params = {}) => {
    const response = await api.get('/products/search', {
      params: {
        q: query,
        ...params,
      },
    });
    return response.data;
  },
};

export default productService;
