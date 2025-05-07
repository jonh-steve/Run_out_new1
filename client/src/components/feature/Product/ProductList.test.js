// src/components/feature/Product/ProductList.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './ProductList';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../../../store/slices/productSlice';
import cartReducer from '../../../store/slices/cartSlice';

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Gậy Billiard Pro Series X1',
    brand: 'ProCue',
    price: 1500000,
    images: ['/assets/products/cue1.jpg'],
  },
  {
    id: '2',
    name: 'Bộ bi-a Pro Tournament',
    brand: 'GameMaster',
    price: 850000,
    images: ['/assets/products/balls1.jpg'],
  },
];

// Test store
const testStore = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
  preloadedState: {
    products: {
      products: [],
      isLoading: false,
      error: null,
      filters: {},
    },
    cart: {
      items: [],
      total: 0,
    },
  },
});

// Test wrapper
const TestWrapper = ({ children }) => (
  <Provider store={testStore}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe('ProductList component', () => {
  test('renders empty state when no products', () => {
    render(<ProductList products={[]} />, { wrapper: TestWrapper });
    expect(screen.getByText('Không có sản phẩm')).toBeInTheDocument();
  });

  test('renders correct number of products', () => {
    render(<ProductList products={mockProducts} />, { wrapper: TestWrapper });
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('displays product names correctly', () => {
    render(<ProductList products={mockProducts} />, { wrapper: TestWrapper });
    expect(screen.getByText('Gậy Billiard Pro Series X1')).toBeInTheDocument();
    expect(screen.getByText('Bộ bi-a Pro Tournament')).toBeInTheDocument();
  });
});
