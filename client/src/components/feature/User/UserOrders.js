// src/components/feature/User/UserOrders.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../../../store/slices/orderSlice';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { formatDate, formatPrice } from '../../../utils/formatters';
import { Empty } from '../../common/Empty';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    processing: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    shipped: { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
    delivered: { text: 'Đã giao hàng', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

const UserOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

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

  if (!orders || orders.length === 0) {
    return <Empty message="Bạn chưa có đơn hàng nào" />;
  }

  return (
    <div className="bg-white rounded-lg border">
      <h2 className="text-xl font-semibold p-6 border-b">Đơn hàng của tôi</h2>

      <div className="divide-y">
        {orders.map((order) => (
          <div key={order._id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium mb-1">Đơn hàng #{order.orderNumber}</p>
                <p className="text-sm text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end">
                <OrderStatusBadge status={order.status} />
                <p className="font-bold mt-2">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center">
                  <span className="text-gray-500 mr-2">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            <Link
              to={`/profile/orders/${order._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;
