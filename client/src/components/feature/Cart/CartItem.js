// src/components/feature/Cart/CartItem.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../../store/slices/cartSlice';
import { Button } from '../../common/Button/Button';
import { formatPrice } from '../../../utils/formatters';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(
      updateCartItem({
        productId: item.product._id,
        quantity: newQuantity,
      })
    );
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.product._id));
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <img
          src={item.product.images[0] || '/assets/placeholder.jpg'}
          alt={item.product.name}
          className="w-16 h-16 object-cover"
        />

        <div>
          <h3 className="font-medium">{item.product.name}</h3>
          <p className="text-gray-500 text-sm">{formatPrice(item.price)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded">
          <button
            className="px-2 py-1 text-gray-500"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            -
          </button>
          <span className="px-3 py-1">{item.quantity}</span>
          <button
            className="px-2 py-1 text-gray-500"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            +
          </button>
        </div>

        <div className="text-right">
          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
        </div>

        <Button onClick={handleRemove} variant="outline" size="sm">
          Xóa
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
