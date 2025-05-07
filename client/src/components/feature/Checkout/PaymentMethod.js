// src/components/feature/Checkout/PaymentMethod.js
// Component hiển thị các phương thức thanh toán trong quá trình thanh toán
// Được sử dụng trong CheckoutForm.js

import React from 'react';
import { Radio } from '../../common';

const PaymentMethod = ({ register, selectedMethod, errors, onChange }) => {
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: '💵',
    },
    {
      id: 'vnpay',
      name: 'Thanh toán qua VNPay',
      description: 'Thanh toán an toàn bằng thẻ ATM, Visa, MasterCard qua cổng VNPay',
      icon: '💳',
    },
    {
      id: 'momo',
      name: 'Thanh toán qua Ví MoMo',
      description: 'Thanh toán nhanh chóng qua ứng dụng MoMo',
      icon: '📱',
    },
  ];

  // Xử lý khi người dùng chọn phương thức thanh toán
  const handleChange = (methodId) => {
    if (onChange) {
      onChange(methodId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-semibold text-lg mb-4">Phương thức thanh toán</h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
            }`}
          >
            <label className="flex items-start cursor-pointer w-full">
              {register ? (
                // Sử dụng với react-hook-form
                <input
                  type="radio"
                  value={method.id}
                  {...register('paymentMethod')}
                  className="mt-1 mr-3"
                  onChange={() => handleChange(method.id)}
                />
              ) : (
                // Sử dụng với state thông thường
                <Radio
                  id={method.id}
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => handleChange(method.id)}
                  className="mt-1 mr-3"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="mr-2 text-xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{method.description}</p>

                {/* Hiển thị thông tin bổ sung cho phương thức thanh toán */}
                {selectedMethod === method.id && method.id === 'vnpay' && (
                  <div className="mt-3 text-sm bg-gray-50 p-3 rounded">
                    <p>Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.</p>
                  </div>
                )}

                {selectedMethod === method.id && method.id === 'momo' && (
                  <div className="mt-3 text-sm bg-gray-50 p-3 rounded">
                    <p>Bạn sẽ được chuyển đến ứng dụng MoMo để hoàn tất giao dịch.</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      {errors && errors.paymentMethod && (
        <p className="text-red-500 text-sm mt-2">{errors.paymentMethod.message}</p>
      )}
    </div>
  );
};

export default PaymentMethod;
