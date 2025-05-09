// client/src/services/productService.js
// File này chứa các dịch vụ và endpoints API liên quan đến sản phẩm và danh mục
// Vị trí: client/src/services/productService.js

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
    // Thêm mới các endpoints
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    addProductReview: builder.mutation({
      query: ({ productId, reviewData }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Product', id: productId },
      ],
    }),
    getCategoryById: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    getProductsByCategory: builder.query({
      query: ({ categoryId, ...params }) => ({
        url: `/categories/${categoryId}/products`,
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
    searchProducts: builder.query({
      query: ({ query, ...params }) => ({
        url: '/products/search',
        params: { q: query, ...params },
      }),
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

// Export hooks
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetProductReviewsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductReviewMutation,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
} = productApi;

// Regular API service for use with Redux Thunk
const productService = {
  /**
   * Lấy danh sách sản phẩm
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
   */
  getProducts: async (params = {}) => {
    const response = await axios.get(PRODUCTS_URL, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} id - ID sản phẩm
   * @returns {Promise<Object>} Thông tin chi tiết sản phẩm
   */
  getProductById: async (id) => {
    const response = await axios.get(`${PRODUCTS_URL}/${id}`);
    return response.data;
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categoryId - ID danh mục
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await axios.get(`${CATEGORIES_URL}/${categoryId}/products`, { params });
    return response.data;
  },

  /**
   * Tìm kiếm sản phẩm
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise<Object>} Kết quả tìm kiếm
   */
  searchProducts: async (query, params = {}) => {
    const response = await axios.get(`${PRODUCTS_URL}/search`, {
      params: {
        q: query,
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Tạo sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm
   * @returns {Promise<Object>} Sản phẩm đã tạo
   */
  createProduct: async (productData) => {
    const response = await axios.post(PRODUCTS_URL, productData);
    return response.data;
  },

  /**
   * Cập nhật sản phẩm
   * @param {string} id - ID sản phẩm
   * @param {Object} productData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Sản phẩm đã cập nhật
   */
  updateProduct: async (id, productData) => {
    const response = await axios.put(`${PRODUCTS_URL}/${id}`, productData);
    return response.data;
  },

  /**
   * Xóa sản phẩm
   * @param {string} id - ID sản phẩm
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteProduct: async (id) => {
    const response = await axios.delete(`${PRODUCTS_URL}/${id}`);
    return response.data;
  },

  /**
   * Thêm đánh giá cho sản phẩm
   * @param {string} productId - ID sản phẩm
   * @param {Object} reviewData - Dữ liệu đánh giá
   * @returns {Promise<Object>} Đánh giá đã tạo
   */
  addProductReview: async (productId, reviewData) => {
    const response = await axios.post(`${PRODUCTS_URL}/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Lấy đánh giá của sản phẩm
   * @param {string} productId - ID sản phẩm
   * @returns {Promise<Array>} Danh sách đánh giá
   */
  getProductReviews: async (productId) => {
    const response = await axios.get(`${PRODUCTS_URL}/${productId}/reviews`);
    return response.data;
  },

  /**
   * Lấy danh sách danh mục
   * @returns {Promise<Array>} Danh sách danh mục
   */
  getCategories: async () => {
    const response = await axios.get(CATEGORIES_URL);
    return response.data;
  },

  /**
   * Lấy chi tiết danh mục theo ID
   * @param {string} id - ID danh mục
   * @returns {Promise<Object>} Thông tin chi tiết danh mục
   */
  getCategoryById: async (id) => {
    const response = await axios.get(`${CATEGORIES_URL}/${id}`);
    return response.data;
  },

  /**
   * Tạo danh mục mới
   * @param {Object} categoryData - Dữ liệu danh mục
   * @returns {Promise<Object>} Danh mục đã tạo
   */
  createCategory: async (categoryData) => {
    const response = await axios.post(CATEGORIES_URL, categoryData);
    return response.data;
  },

  /**
   * Cập nhật danh mục
   * @param {string} id - ID danh mục
   * @param {Object} categoryData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Danh mục đã cập nhật
   */
  updateCategory: async (id, categoryData) => {
    const response = await axios.put(`${CATEGORIES_URL}/${id}`, categoryData);
    return response.data;
  },

  /**
   * Xóa danh mục
   * @param {string} id - ID danh mục
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteCategory: async (id) => {
    const response = await axios.delete(`${CATEGORIES_URL}/${id}`);
    return response.data;
  },
};

export default productService;
export { productService, API_URL, PRODUCTS_URL, CATEGORIES_URL };
// Đoạn mã này định nghĩa các dịch vụ và endpoints API liên quan đến sản phẩm và danh mục
