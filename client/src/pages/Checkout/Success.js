// src/pages/Checkout/Success.js
// Trang xác nhận đơn hàng thành công
// Xử lý xác thực thanh toán từ các cổng thanh toán và hiển thị thông tin đơn hàng

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearCart } from '../../store/slices/cartSlice';
import { getOrderById } from '../../store/slices/orderSlice';
import paymentService from '../../services/paymentService';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/common/Button/Button';
import LoadingSpinner from '../../components/common/LoadingSpiner';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const CheckoutSuccessPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('orderId');

        // Trường hợp 1: Thanh toán qua VNPay
        if (location.search.includes('vnp_')) {
          // Chuyển search params thành object
          const vnpParams = {};
          for (const [key, value] of searchParams.entries()) {
            vnpParams[key] = value;
          }

          // Xác thực thanh toán với backend
          const verifyResult = await paymentService.verifyVnpayReturn(vnpParams);

          setIsSuccess(verifyResult.isSuccess);

          if (verifyResult.isSuccess) {
            dispatch(clearCart());
            // Lấy thông tin đơn hàng
            const orderData = await dispatch(getOrderById(verifyResult.orderId)).unwrap();
            setOrder(orderData);
          } else {
            setErrorMessage(
              verifyResult.message || 'Thanh toán không thành công. Vui lòng thử lại.'
            );
          }
        }
        // Trường hợp 2: Thanh toán qua MoMo
        else if (location.search.includes('momo_')) {
          // Tương tự như VNPay
          const momoParams = {};
          for (const [key, value] of searchParams.entries()) {
            momoParams[key] = value;
          }

          const verifyResult = await paymentService.verifyMomoReturn(momoParams);

          setIsSuccess(verifyResult.isSuccess);

          if (verifyResult.isSuccess) {
            dispatch(clearCart());
            const orderData = await dispatch(getOrderById(verifyResult.orderId)).unwrap();
            setOrder(orderData);
          } else {
            setErrorMessage(
              verifyResult.message || 'Thanh toán không thành công. Vui lòng thử lại.'
            );
          }
        }
        // Trường hợp 3: Thanh toán COD hoặc đã xác nhận từ trước
        else if (orderId) {
          const orderData = await dispatch(getOrderById(orderId)).unwrap();
          setOrder(orderData);
          setIsSuccess(true);
          dispatch(clearCart());
        }
        // Trường hợp 4: Không có thông tin đơn hàng
        else {
          setErrorMessage('Không tìm thấy thông tin đơn hàng');
          setIsSuccess(false);
          setTimeout(() => navigate('/'), 3000); // Chuyển về trang chủ sau 3 giây
        }
      } catch (error) {
        console.error('Lỗi khi xác thực thanh toán:', error);
        setIsSuccess(false);
        setErrorMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [location, dispatch, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4 flex justify-center items-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            {isSuccess ? (
              <>
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-700 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>
              </>
            ) : (
              <>
                <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-2">
                  Thanh toán không thành công
                </h1>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
              </>
            )}
          </div>

          {order && (
            <div className="mb-8 border-t border-b py-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Mã đơn hàng:</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày đặt:</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Trạng thái:</p>
                  <p className="font-medium">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status === 'pending'
                        ? 'Chờ xác nhận'
                        : order.status === 'confirmed'
                          ? 'Đã xác nhận'
                          : order.status === 'delivered'
                            ? 'Đã giao hàng'
                            : order.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tổng tiền:</p>
                  <p className="font-medium text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      order.totalAmount
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/">
              <Button variant="outline" fullWidth>
                Tiếp tục mua sắm
              </Button>
            </Link>

            {order && (
              <Link to={`/profile/orders/${order.id}`}>
                <Button variant="primary" fullWidth>
                  Xem chi tiết đơn hàng
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutSuccessPage;
