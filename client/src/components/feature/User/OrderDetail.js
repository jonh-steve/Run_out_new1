// src/components/feature/User/OrderDetail.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderDetail } from '../../../store/slices/orderSlice';
import { formatDate, formatPrice } from '../../../utils/formatters';
import { LoadingSpinner } from '../../common/LoadingSpinner';

const OrderStatus = ({ status, statusHistory }) => {
  const statusSteps = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipped', label: 'Đang giao hàng' },
    { key: 'delivered', label: 'Đã giao hàng' },
  ];

  // Find current status index
  const currentIndex = statusSteps.findIndex((step) => step.key === status);

  // Handle cancelled order
  if (status === 'cancelled') {
    return (
      <div className="mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            ✕
          </div>
          <div className="ml-3">
            <p className="font-medium">Đơn hàng đã bị hủy</p>
            <p className="text-sm text-gray-500">
              {statusHistory &&
                statusHistory.length > 0 &&
                `Ngày hủy: ${formatDate(statusHistory[statusHistory.length - 1].date)}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4">Trạng thái đơn hàng</h3>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
          <div
            className="h-0.5 bg-green-500"
            style={{ width: `${(currentIndex * 100) / (statusSteps.length - 1)}%` }}
          ></div>
        </div>

        {/* Status steps */}
        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                  } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <p className={`text-sm mt-2 ${isCompleted ? 'font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (!currentOrder) {
    return <div className="text-center py-4">Không tìm thấy thông tin đơn hàng</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">Đơn hàng #{currentOrder.orderNumber}</h2>
          <p className="text-gray-500">Ngày đặt: {formatDate(currentOrder.createdAt)}</p>
        </div>
        <div className="font-bold text-lg">{formatPrice(currentOrder.totalAmount)}</div>
      </div>

      <OrderStatus status={currentOrder.status} statusHistory={currentOrder.statusHistory} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium mb-2">Thông tin giao hàng</h3>
          <div className="border rounded-lg p-4">
            <p>{currentOrder.shippingAddress.name}</p>
            <p>{currentOrder.shippingAddress.phone}</p>
            <p>{currentOrder.shippingAddress.street}</p>
            <p>
              {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.zipCode}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Phương thức thanh toán</h3>
          <div className="border rounded-lg p-4">
            <p>
              {currentOrder.paymentMethod === 'cod'
                ? 'Thanh toán khi nhận hàng (COD)'
                : 'Thanh toán qua VNPay'}
            </p>
            <p className="text-sm mt-1">
              Trạng thái:
              <span
                className={
                  currentOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }
              >
                {currentOrder.paymentStatus === 'paid' ? ' Đã thanh toán' : ' Chưa thanh toán'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <h3 className="font-medium mb-2">Chi tiết đơn hàng</h3>
      <div className="border rounded-lg">
        <div className="divide-y">
          {currentOrder.items.map((item) => (
            <div key={item._id} className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tạm tính:</span>
            <span>{formatPrice(currentOrder.subtotal)}</span>
          </div>
          {currentOrder.discount && currentOrder.discount.amount > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(currentOrder.discount.amount)}</span>
            </div>
          )}
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span>{formatPrice(currentOrder.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(currentOrder.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
