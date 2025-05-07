// src/pages/Checkout/index.js
// Trang thanh toán chính, tích hợp CheckoutForm và PaymentForm
// Quản lý luồng thanh toán đa bước và xử lý tạo đơn hàng

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../../components/feature/Checkout/CheckoutForm';
import PaymentForm from '../../components/feature/Checkout/PaymentForm';
import MainLayout from '../../components/layout/MainLayout';

const CheckoutPage = () => {
  const [step, setStep] = useState('form'); // 'form' | 'payment'
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.cart);

  // Kiểm tra giỏ hàng trống
  if (cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
            <p className="mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Xử lý khi hoàn thành bước nhập thông tin giao hàng
  const handleFormSubmit = (data) => {
    setShippingInfo(data.shippingInfo);
    setStep('payment');
  };

  // Xử lý khi quay lại bước nhập thông tin
  const handleBackToForm = () => {
    setStep('form');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>

        {/* Hiển thị các bước thanh toán */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              1
            </div>
            <div className="text-sm ml-2">Thông tin giao hàng</div>
            <div className="w-16 h-1 mx-2 bg-gray-200"></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              2
            </div>
            <div className="text-sm ml-2">Thanh toán</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {step === 'form' && (
            <CheckoutForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          )}

          {step === 'payment' && shippingInfo && (
            <div>
              <div className="bg-white p-4 rounded-lg border mb-6">
                <h2 className="font-semibold text-lg mb-4">Thông tin giao hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Họ tên:</p>
                    <p className="font-medium">{shippingInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số điện thoại:</p>
                    <p className="font-medium">{shippingInfo.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Địa chỉ:</p>
                    <p className="font-medium">
                      {shippingInfo.address}, {shippingInfo.city} {shippingInfo.zipCode}
                    </p>
                  </div>
                  {shippingInfo.notes && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Ghi chú:</p>
                      <p className="font-medium">{shippingInfo.notes}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBackToForm}
                  className="text-blue-600 mt-4 text-sm hover:underline"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>

              <PaymentForm shippingInfo={shippingInfo} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
