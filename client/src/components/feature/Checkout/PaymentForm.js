// src/components/feature/Checkout/PaymentForm.js
// Component xử lý thanh toán và tạo đơn hàng
// Được sử dụng trong trang Checkout

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { createOrder } from '../../../store/slices/orderSlice';
import { clearCart } from '../../../store/slices/cartSlice';
import { Button } from '../../common';
import PaymentMethod from './PaymentMethod';
import paymentService from '../../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const PaymentForm = ({ shippingInfo }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.cart);

  // Tính tổng tiền đơn hàng bao gồm phí vận chuyển
  const calculateTotal = () => {
    const shippingFee = shippingInfo.shippingMethod === 'express' ? 50000 : 30000;
    return cart.total + shippingFee;
  };

  // Xử lý khi người dùng thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null); // Xóa lỗi khi thay đổi phương thức
  };

  // Xử lý khi người dùng gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Tạo đơn hàng
      const orderData = {
        items: cart.items,
        shippingInfo,
        paymentMethod,
        total: calculateTotal(),
      };

      const order = await dispatch(createOrder(orderData)).unwrap();

      // Xử lý theo phương thức thanh toán
      switch (paymentMethod) {
        case 'vnpay':
          // Tạo URL thanh toán VNPay
          const vnpayData = await paymentService.createVnpayPaymentUrl(
            order.id,
            order.totalAmount,
            `Thanh toán đơn hàng ${order.orderNumber}`
          );
          // Chuyển hướng đến trang thanh toán VNPay
          window.location.href = vnpayData.paymentUrl;
          break;

        case 'momo':
          // Tạo URL thanh toán MoMo
          const momoData = await paymentService.createMomoPaymentUrl(
            order.id,
            order.totalAmount,
            `Thanh toán đơn hàng ${order.orderNumber}`
          );
          // Chuyển hướng đến trang thanh toán MoMo
          window.location.href = momoData.paymentUrl;
          break;

        case 'cod':
        default:
          // Nếu là COD, xóa giỏ hàng và chuyển đến trang xác nhận
          dispatch(clearCart());
          navigate(`/checkout/success?orderId=${order.id}`);
          break;
      }
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      setError('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Hoàn tất thanh toán</h2>

      <form onSubmit={handleSubmit}>
        {/* Hiển thị tóm tắt đơn hàng */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Tóm tắt đơn hàng</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  cart.total
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Phí vận chuyển ({shippingInfo.shippingMethod === 'express' ? 'Nhanh' : 'Tiêu chuẩn'}
                ):
              </span>
              <span>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  shippingInfo.shippingMethod === 'express' ? 50000 : 30000
                )}
              </span>
            </div>
            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
              <span>Tổng cộng:</span>
              <span>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  calculateTotal()
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Sử dụng component PaymentMethod */}
        <PaymentMethod selectedMethod={paymentMethod} onChange={handlePaymentMethodChange} />

        {/* Hiển thị lỗi nếu có */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mt-4">{error}</div>}

        <div className="border-t pt-4 mt-6">
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            {paymentMethod === 'cod'
              ? 'Hoàn tất đơn hàng'
              : `Thanh toán với ${paymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
