// src/components/feature/Cart/AddToCart.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';
import { Button } from '../../common/Button/Button';

const AddToCart = ({ product }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const { loading } = useSelector((state) => state.cart);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product._id,
        quantity,
      })
    );
  };

  if (product.stock < 1) {
    return (
      <div className="mt-6">
        <p className="text-red-500 mb-2">Hết hàng</p>
        <Button variant="outline" disabled className="w-full">
          Hết hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <span className="mr-3">Số lượng:</span>
        <div className="flex items-center border rounded">
          <button
            className="px-3 py-1 text-gray-500"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-1">{quantity}</span>
          <button
            className="px-3 py-1 text-gray-500"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
        <span className="ml-3 text-sm text-gray-500">{product.stock} sản phẩm có sẵn</span>
      </div>

      <Button onClick={handleAddToCart} isLoading={loading} className="w-full">
        Thêm vào giỏ hàng
      </Button>
    </div>
  );
};

export default AddToCart;
