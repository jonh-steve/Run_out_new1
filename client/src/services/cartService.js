import api from './api';
import { isAuthenticated } from '../utils/authToken';

export const cartService = {
  // Get cart (for authenticated users)
  async getCart() {
    if (!isAuthenticated()) {
      // Return local cart for guest users
      return this.getLocalCart();
    }

    try {
      const { data } = await api.get('/carts/me');
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    if (!isAuthenticated()) {
      // Use local cart for guest users
      return this.addToLocalCart(productId, quantity);
    }

    try {
      const { data } = await api.post('/carts/items', { productId, quantity });
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Update cart item
  async updateCartItem(productId, quantity) {
    if (!isAuthenticated()) {
      // Use local cart for guest users
      return this.updateLocalCartItem(productId, quantity);
    }

    try {
      const { data } = await api.put(`/carts/items/${productId}`, { quantity });
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId) {
    if (!isAuthenticated()) {
      // Use local cart for guest users
      return this.removeFromLocalCart(productId);
    }

    try {
      const { data } = await api.delete(`/carts/items/${productId}`);
      return data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart() {
    if (!isAuthenticated()) {
      // Use local cart for guest users
      return this.clearLocalCart();
    }

    try {
      const { data } = await api.delete('/carts/items');
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Local cart methods (for guest users)
  getLocalCart() {
    const cartJson = localStorage.getItem('guest_cart');
    return cartJson ? JSON.parse(cartJson) : { items: [] };
  },

  saveLocalCart(cart) {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    return cart;
  },

  async addToLocalCart(productId, quantity) {
    // Fetch product details first
    const { data: product } = await api.get(`/products/${productId}`);

    // Get current cart
    const cart = this.getLocalCart();

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.id === productId);

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product,
        quantity,
      });
    }

    // Save updated cart
    return this.saveLocalCart(cart);
  },

  updateLocalCartItem(productId, quantity) {
    // Get current cart
    const cart = this.getLocalCart();

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.product.id === productId);

    if (itemIndex !== -1) {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;

      // Save updated cart
      return this.saveLocalCart(cart);
    }

    return cart;
  },

  removeFromLocalCart(productId) {
    // Get current cart
    const cart = this.getLocalCart();

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.product.id !== productId);

    // Save updated cart
    return this.saveLocalCart(cart);
  },

  clearLocalCart() {
    // Clear cart
    const emptyCart = { items: [] };

    // Save empty cart
    return this.saveLocalCart(emptyCart);
  },
};
