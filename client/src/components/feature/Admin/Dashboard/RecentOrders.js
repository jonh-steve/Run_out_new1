// src/components/feature/Admin/Dashboard/RecentOrders.js
// Vị trí: Component hiển thị danh sách đơn hàng gần đây trên Dashboard Admin

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '../../../../utils/formatters';
import { Button, LoadingSpinner } from '../../../common';

/**
 * Component hiển thị trạng thái đơn hàng dưới dạng badge
 */
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
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

/**
 * Component hiển thị danh sách đơn hàng gần đây
 */
const RecentOrders = ({ orders = [], isLoading = false, onViewAllClick }) => {
  // Xử lý sự kiện khi nhấp vào nút "Xem tất cả"
  const handleViewAllClick = (e) => {
    if (onViewAllClick) {
      e.preventDefault();
      onViewAllClick();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center p-8">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/admin/orders/${order._id || order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.customerInfo.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                    Không có đơn hàng nào gần đây
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 border-t bg-gray-50">
        <Link to="/admin/orders" onClick={handleViewAllClick}>
          <Button variant="secondary" size="sm" fullWidth>
            Xem tất cả đơn hàng
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RecentOrders;
