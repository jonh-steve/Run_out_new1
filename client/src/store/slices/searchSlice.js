import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

// Async thunk for searching products
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (keyword, { rejectWithValue }) => {
    try {
      return await productService.searchProducts(keyword);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  keyword: '',
  results: [],
  loading: false,
  error: null,
  recentSearches: [],
  filters: {
    category: null,
    priceRange: { min: 0, max: 10000000 },
    sortBy: 'relevance',
  },
};

// Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setKeyword: (state, action) => {
      state.keyword = action.payload;

      // Add to recent searches if not already there
      if (action.payload && !state.recentSearches.includes(action.payload)) {
        state.recentSearches = [
          action.payload,
          ...state.recentSearches.slice(0, 4), // Keep only 5 most recent
        ];
      }
    },
    clearResults: (state) => {
      state.results = [];
    },
    setSearchFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const {
  setKeyword,
  clearResults,
  setSearchFilters,
  clearSearchFilters,
  clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;
