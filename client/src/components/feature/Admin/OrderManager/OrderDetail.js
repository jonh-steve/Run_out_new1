// src/components/feature/Admin/OrderManager/OrderDetail.js
import React from 'react';
import { formatDate, formatPrice } from '../../../../utils/formatters';
import { Button } from '../../../common/Button/Button';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    processing: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    packed: { text: 'Đóng gói', color: 'bg-indigo-100 text-indigo-800' },
    shipped: { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
    delivered: { text: 'Đã giao hàng', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    returned: { text: 'Đã trả hàng', color: 'bg-gray-100 text-gray-800' },
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

const OrderStatusFlow = ({ currentStatus, onChangeStatus }) => {
  const statuses = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'packed', label: 'Đã đóng gói' },
    { key: 'shipped', label: 'Đang giao hàng' },
    { key: 'delivered', label: 'Đã giao hàng' },
  ];

  // Tìm vị trí status hiện tại
  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Trạng thái đơn hàng</h3>

        {/* Nút cập nhật trạng thái */}
        {currentStatus !== 'cancelled' &&
          currentStatus !== 'delivered' &&
          currentStatus !== 'returned' && (
            <div className="flex space-x-2">
              <select
                className="block w-40 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  Cập nhật trạng thái
                </option>
                {statuses.map((status, index) => {
                  // Chỉ cho phép đổi sang trạng thái tiếp theo
                  if (index === currentIndex + 1) {
                    return (
                      <option key={status.key} value={status.key}>
                        {status.label}
                      </option>
                    );
                  }
                  return null;
                })}
                <option value="cancelled">Hủy đơn hàng</option>
              </select>

              <Button size="sm">Cập nhật</Button>
            </div>
          )}
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
          <div
            className={`h-0.5 bg-blue-500 ${
              currentStatus === 'cancelled' || currentStatus === 'returned'
                ? 'w-0' // Không có progress nếu đơn hàng bị hủy hoặc trả lại
                : `w-${(currentIndex * 100) / (statuses.length - 1)}%`
            }`}
          ></div>
        </div>

        <div className="flex justify-between relative">
          {statuses.map((status, index) => {
            const isCompleted =
              index <= currentIndex &&
              currentStatus !== 'cancelled' &&
              currentStatus !== 'returned';
            const isCurrent = status.key === currentStatus;

            return (
              <div key={status.key} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-blue-500 text-white'
                      : currentStatus === 'cancelled' && index === 0
                        ? 'bg-red-500 text-white'
                        : currentStatus === 'returned' && index === statuses.length - 1
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-200'
                  } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <p className={`text-xs mt-2 ${isCompleted ? 'font-medium' : 'text-gray-500'}`}>
                  {status.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trạng thái đặc biệt */}
      {(currentStatus === 'cancelled' || currentStatus === 'returned') && (
        <div
          className={`mt-6 p-4 rounded-md ${
            currentStatus === 'cancelled' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">{currentStatus === 'cancelled' ? '⚠️' : '↩️'}</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {currentStatus === 'cancelled' ? 'Đơn hàng đã bị hủy' : 'Đơn hàng đã được trả lại'}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderDetail = ({ order, onChangeStatus }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Đơn hàng #{order.orderNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">Ngày đặt: {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Status Flow */}
      <div className="px-6 py-4">
        <OrderStatusFlow currentStatus={order.status} onChangeStatus={onChangeStatus} />
      </div>

      {/* Customer & Shipping Info */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
            <p className="text-sm text-gray-700">{order.customerInfo.name}</p>
            <p className="text-sm text-gray-700">{order.customerInfo.email}</p>
            <p className="text-sm text-gray-700">{order.customerInfo.phone}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin giao hàng</h3>
            <p className="text-sm text-gray-700">{order.shippingAddress.name}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress.phone}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-700">
              {order.shippingAddress.city}, {order.shippingAddress.zipCode}
            </p>
            {order.shippingAddress.notes && (
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Ghi chú:</span> {order.shippingAddress.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin thanh toán</h3>
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </span>

          <span className="ml-4 text-sm text-gray-700">
            Phương thức:{' '}
            {order.paymentMethod === 'cod'
              ? 'Thanh toán khi nhận hàng (COD)'
              : 'Thanh toán qua VNPay'}
          </span>
        </div>

        {order.paymentDetails && order.paymentDetails.transactionId && (
          <p className="text-sm text-gray-700 mt-2">
            Mã giao dịch: {order.paymentDetails.transactionId}
          </p>
        )}
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết đơn hàng</h3>

        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sản phẩm
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Đơn giá
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Số lượng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item._id || item.product}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4">
        <div className="flex flex-col space-y-2 sm:w-64 sm:ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount && order.discount.amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(order.discount.amount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>

          {order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Thuế:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-medium pt-2 border-t mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Order History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Lịch sử đơn hàng</h3>

          <div className="flow-root">
            <ul className="-mb-8">
              {order.statusHistory.map((history, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== order.statusHistory.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <svg
                            className="h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            <OrderStatusBadge status={history.status} />
                            {history.note && <span className="ml-2">{history.note}</span>}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(history.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Ghi chú quản trị</h3>

        <div className="mt-1">
          <textarea
            rows={3}
            className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Thêm ghi chú về đơn hàng này..."
            defaultValue={order.adminNotes || ''}
          />
        </div>

        <div className="mt-2 flex justify-end">
          <Button size="sm">Lưu ghi chú</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
