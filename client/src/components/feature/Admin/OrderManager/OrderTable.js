// src/components/feature/Admin/OrderManager/OrderTable.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '../../../../utils/formatters';

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

const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
    authorized: { text: 'Đã ủy quyền', color: 'bg-blue-100 text-blue-800' },
    paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
    failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
    refunded: { text: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
    partially_refunded: { text: 'Hoàn tiền một phần', color: 'bg-orange-100 text-orange-800' },
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

const OrderTable = ({ orders, onChangeStatus }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="mt-4">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mã đơn hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Khách hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ngày đặt
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tổng tiền
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái đơn hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thanh toán
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Chi tiết</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{order.customerInfo.name}</div>
                        <div className="text-xs">{order.customerInfo.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{indexOfFirstOrder + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(indexOfLastOrder, orders.length)}</span> của{' '}
              <span className="font-medium">{orders.length}</span> đơn hàng
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                &laquo;
              </button>

              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => setCurrentPage(number + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === number + 1
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {number + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
