// src/components/feature/Checkout/CheckoutForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../common/Button/Button';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';

const schema = yup.object({
  shippingInfo: yup.object({
    fullName: yup.string().required('Vui lòng nhập họ tên'),
    phone: yup.string().required('Vui lòng nhập số điện thoại'),
    address: yup.string().required('Vui lòng nhập địa chỉ'),
    city: yup.string().required('Vui lòng nhập thành phố'),
    zipCode: yup.string(),
    notes: yup.string(),
  }),
  paymentMethod: yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

const CheckoutForm = ({ onSubmit, isSubmitting }) => {
  const [activeStep, setActiveStep] = useState('shipping'); // 'shipping' | 'payment'

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
      },
      paymentMethod: 'cod',
    },
  });

  const watchShippingInfo = watch('shippingInfo');
  const watchPaymentMethod = watch('paymentMethod');

  const handleNextStep = () => {
    if (activeStep === 'shipping') {
      setActiveStep('payment');
    }
  };

  const handlePrevStep = () => {
    if (activeStep === 'payment') {
      setActiveStep('shipping');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {activeStep === 'shipping' && (
        <>
          <ShippingInfo register={register} errors={errors} />
          <div className="flex justify-end">
            <Button onClick={handleNextStep}>Tiếp theo</Button>
          </div>
        </>
      )}

      {activeStep === 'payment' && (
        <>
          <PaymentMethod register={register} selectedMethod={watchPaymentMethod} errors={errors} />
          <div className="flex justify-between">
            <Button onClick={handlePrevStep} variant="outline">
              Quay lại
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Hoàn tất đặt hàng
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default CheckoutForm;
