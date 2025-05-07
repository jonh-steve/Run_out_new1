// src/pages/Checkout/Success.js
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import MainLayout from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button/Button';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { orderId } = location.state || {};

  useEffect(() => {
    // Clear cart after successful order
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center bg-white p-8 rounded-lg border">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng. Đơn hàng #{orderId} của bạn đã được tiếp nhận và đang được xử
            lý.
          </p>
          <p className="text-gray-500 mb-8">
            Chúng tôi sẽ gửi email xác nhận kèm theo thông tin đơn hàng của bạn.
          </p>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <Link to="/">
              <Button variant="outline">Tiếp tục mua sắm</Button>
            </Link>
            <Link to="/profile/orders">
              <Button>Xem đơn hàng</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutSuccessPage;
