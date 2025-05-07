// src/components/feature/Checkout/CheckoutForm.js
// Form thanh toán đa bước, xử lý thông tin giao hàng
// Được sử dụng trong trang Checkout

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../common/Button/Button';
import ShippingInfo from './ShippingInfo';
import { Radio } from '../../common';

const schema = yup.object({
  shippingInfo: yup.object({
    fullName: yup.string().required('Vui lòng nhập họ tên'),
    phone: yup.string().required('Vui lòng nhập số điện thoại'),
    address: yup.string().required('Vui lòng nhập địa chỉ'),
    city: yup.string().required('Vui lòng nhập thành phố'),
    zipCode: yup.string(),
    notes: yup.string(),
    shippingMethod: yup.string().required('Vui lòng chọn phương thức vận chuyển'),
  }),
});

const CheckoutForm = ({ onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      shippingInfo: {
        fullName: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        notes: '',
        shippingMethod: 'standard',
      },
    },
  });

  const watchShippingMethod = watch('shippingInfo.shippingMethod');

  // Tính phí vận chuyển dựa trên phương thức
  const getShippingFee = () => {
    return watchShippingMethod === 'express' ? 50000 : 30000;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ShippingInfo register={register} errors={errors} />

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold text-lg mb-4">Phương thức vận chuyển</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 border rounded">
            <input
              type="radio"
              id="standard"
              value="standard"
              {...register('shippingInfo.shippingMethod')}
              className="mr-2"
            />
            <label htmlFor="standard" className="flex-1">
              <div className="font-medium">Giao hàng tiêu chuẩn</div>
              <div className="text-sm text-gray-500">3-5 ngày - 30.000₫</div>
            </label>
          </div>

          <div className="flex items-center p-3 border rounded">
            <input
              type="radio"
              id="express"
              value="express"
              {...register('shippingInfo.shippingMethod')}
              className="mr-2"
            />
            <label htmlFor="express" className="flex-1">
              <div className="font-medium">Giao hàng nhanh</div>
              <div className="text-sm text-gray-500">1-2 ngày - 50.000₫</div>
            </label>
          </div>
        </div>
        {errors.shippingInfo?.shippingMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.shippingInfo.shippingMethod.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Tiếp tục
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;
