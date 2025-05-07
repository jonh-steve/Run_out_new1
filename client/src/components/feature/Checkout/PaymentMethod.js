// src/components/feature/Checkout/PaymentMethod.js
import React from 'react';

const PaymentMethod = ({ register, selectedMethod, errors }) => {
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
  ];

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-semibold text-lg mb-4">Phương thức thanh toán</h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                value={method.id}
                {...register('paymentMethod')}
                className="mt-1 mr-3"
              />
              <div>
                <div className="flex items-center">
                  <span className="mr-2">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{method.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      {errors.paymentMethod && (
        <p className="text-red-500 text-sm mt-2">{errors.paymentMethod.message}</p>
      )}
    </div>
  );
};

export default PaymentMethod;
