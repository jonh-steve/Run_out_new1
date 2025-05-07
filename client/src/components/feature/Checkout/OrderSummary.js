// src/components/feature/Checkout/OrderSummary.js
import React from 'react';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../../utils/formatters';

const OrderSummary = () => {
  const { items, subtotal, discount, shipping } = useSelector((state) => state.cart);
  const total = subtotal - (discount || 0) + (shipping || 0);

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h2>

      <div className="divide-y">
        {items.map((item) => (
          <div key={item.product._id} className="py-3 flex justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">{item.quantity} x</span>
              <span>{item.product.name}</span>
            </div>
            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển:</span>
          <span>{shipping ? formatPrice(shipping) : 'Miễn phí'}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Tổng cộng:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
