import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(productId, quantity);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItem(productId, quantity);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId, { rejectWithValue }) => {
    try {
      return await cartService.removeFromCart(productId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.clearCart();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions
const calculateTotals = (items) => {
  return items.reduce(
    (totals, item) => {
      const itemTotal = item.product.price * item.quantity;
      return {
        itemsCount: totals.itemsCount + item.quantity,
        subtotal: totals.subtotal + itemTotal,
      };
    },
    { itemsCount: 0, subtotal: 0 }
  );
};

// Initial state
const initialState = {
  items: [],
  itemsCount: 0,
  subtotal: 0,
  loading: false,
  error: null,
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart actions (for guest users)
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;

      // Check if product already exists in cart
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        // Update quantity if product already exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        state.items.push({
          product,
          quantity,
        });
      }

      // Update totals
      const { itemsCount, subtotal } = calculateTotals(state.items);
      state.itemsCount = itemsCount;
      state.subtotal = subtotal;
    },

    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload;

      // Find item in cart
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        // Update quantity
        item.quantity = quantity;

        // Update totals
        const { itemsCount, subtotal } = calculateTotals(state.items);
        state.itemsCount = itemsCount;
        state.subtotal = subtotal;
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;

      // Remove item from cart
      state.items = state.items.filter((item) => item.product.id !== productId);

      // Update totals
      const { itemsCount, subtotal } = calculateTotals(state.items);
      state.itemsCount = itemsCount;
      state.subtotal = subtotal;
    },

    clearCart: (state) => {
      // Reset cart
      state.items = [];
      state.itemsCount = 0;
      state.subtotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;

        // Calculate totals
        const { itemsCount, subtotal } = calculateTotals(action.payload.items);
        state.itemsCount = itemsCount;
        state.subtotal = subtotal;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle other async actions with similar patterns
    // ...
  },
});

// Export actions and reducer
export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
