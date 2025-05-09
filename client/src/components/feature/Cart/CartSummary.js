// src/components/feature/Cart/CartSummary.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '../../common/Button';
import { formatPrice } from '../../../utils/formatters';

const CartSummary = () => {
  const { items, subtotal, discount } = useSelector((state) => state.cart);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal - (discount || 0);

  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="font-semibold mb-4">Tổng đơn hàng</h2>

      <div className="space-y-2 border-b pb-3 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Số lượng sản phẩm:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between font-bold mb-6">
        <span>Tổng cộng:</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Link to="/checkout">
        <Button className="w-full">Tiến hành thanh toán</Button>
      </Link>
    </div>
  );
};

export default CartSummary;
