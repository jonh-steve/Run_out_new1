// src/components/feature/Checkout/ShippingInfo.js
import React from 'react';
import { Input } from '../../common/Input';

const ShippingInfo = ({ register, errors }) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-semibold text-lg mb-4">Thông tin giao hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Họ tên"
            {...register('shippingInfo.fullName')}
            error={errors.shippingInfo?.fullName?.message}
            required
          />
        </div>
        <div>
          <Input
            label="Số điện thoại"
            {...register('shippingInfo.phone')}
            error={errors.shippingInfo?.phone?.message}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Địa chỉ"
            {...register('shippingInfo.address')}
            error={errors.shippingInfo?.address?.message}
            required
          />
        </div>
        <div>
          <Input
            label="Thành phố"
            {...register('shippingInfo.city')}
            error={errors.shippingInfo?.city?.message}
            required
          />
        </div>
        <div>
          <Input
            label="Mã bưu điện"
            {...register('shippingInfo.zipCode')}
            error={errors.shippingInfo?.zipCode?.message}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Ghi chú"
            {...register('shippingInfo.notes')}
            error={errors.shippingInfo?.notes?.message}
            multiline
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
