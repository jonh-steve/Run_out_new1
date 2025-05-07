// src/pages/Checkout/index.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/checkoutSlice';
import MainLayout from '../../components/layout/MainLayout';
import CheckoutForm from '../../components/feature/Checkout/CheckoutForm';
import OrderSummary from '../../components/feature/Checkout/OrderSummary';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, loading: cartLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [items, cartLoading, isAuthenticated, navigate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const result = await dispatch(createOrder(data)).unwrap();

      if (data.paymentMethod === 'vnpay') {
        // Redirect to VNPay payment page
        window.location.href = result.paymentUrl;
      } else {
        // Redirect to success page for COD
        navigate('/checkout/success', { state: { orderId: result.orderId } });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
