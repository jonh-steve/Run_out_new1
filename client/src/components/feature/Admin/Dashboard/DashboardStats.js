// src/components/feature/Admin/Dashboard/DashboardStats.js
// Vị trí: Component hiển thị các thống kê tổng quan trên Dashboard Admin

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

/**
 * Component hiển thị một thẻ thống kê đơn lẻ
 */
const StatCard = ({ title, value, icon: Icon, color, bgColor, change, linkTo }) => {
  const isPositive = change >= 0;

  return (
    <Link
      to={linkTo}
      className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>

          {change !== undefined && (
            <div
              className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change)}% so với tháng trước</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </Link>
  );
};

/**
 * Component hiển thị tất cả các thống kê tổng quan trên Dashboard
 */
const DashboardStats = ({ stats = {} }) => {
  // Định nghĩa các thẻ thống kê
  const statsItems = [
    {
      title: 'Tổng doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        stats?.totalRevenue || 0
      ),
      icon: CurrencyDollarIcon,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      change: stats?.revenueChange,
      linkTo: '/admin/orders',
    },
    {
      title: 'Đơn hàng',
      value: stats?.totalOrders || 0,
      icon: ShoppingCartIcon,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      change: stats?.ordersChange,
      linkTo: '/admin/orders',
    },
    {
      title: 'Sản phẩm',
      value: stats?.totalProducts || 0,
      icon: ShoppingBagIcon,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      change: stats?.productsChange,
      linkTo: '/admin/products',
    },
    {
      title: 'Khách hàng',
      value: stats?.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      change: stats?.customersChange,
      linkTo: '/admin/users',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Tổng quan</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsItems.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            bgColor={item.bgColor}
            change={item.change}
            linkTo={item.linkTo}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
