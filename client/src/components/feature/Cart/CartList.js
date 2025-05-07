// src/components/feature/Cart/CartList.js
import React from 'react';
import { useSelector } from 'react-redux';
import CartItem from './CartItem';
import { Empty } from '../../common/Empty';

const CartList = () => {
  const { items } = useSelector((state) => state.cart);

  if (!items.length) {
    return <Empty message="Giỏ hàng của bạn đang trống" />;
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold">Giỏ hàng của bạn</h2>
      </div>
      <div>
        {items.map((item) => (
          <CartItem key={item.product._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CartList;
