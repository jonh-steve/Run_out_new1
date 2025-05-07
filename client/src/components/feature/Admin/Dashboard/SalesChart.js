// src/components/feature/Admin/Dashboard/SalesChart.js
// Vị trí: Component biểu đồ doanh số bán hàng trên Dashboard Admin, hiển thị doanh thu theo các khoảng thời gian khác nhau

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { LoadingSpinner, ErrorAlert } from '../../../common';

/**
 * Component hiển thị biểu đồ doanh số bán hàng
 * @param {Object} props - Props của component
 * @param {Array} props.data - Dữ liệu doanh số
 * @param {string} props.period - Khoảng thời gian hiện tại (today, week, month, year)
 * @param {boolean} props.isLoading - Trạng thái đang tải dữ liệu
 * @param {string} props.error - Thông báo lỗi (nếu có)
 * @param {Function} props.onPeriodChange - Hàm xử lý khi thay đổi khoảng thời gian
 */
const SalesChart = ({
  data = [],
  period = 'month',
  isLoading = false,
  error = null,
  onPeriodChange = () => {},
}) => {
  // Định dạng số tiền cho trục Y
  const formatYAxis = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  // Định dạng số tiền cho tooltip
  const formatTooltipValue = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Lấy tổng doanh thu từ dữ liệu
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

  // Định dạng tổng doanh thu
  const formattedTotalRevenue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  // Các tùy chọn khoảng thời gian
  const periodOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'year', label: 'Năm' },
  ];

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (newPeriod) => {
    if (period !== newPeriod) {
      onPeriodChange(newPeriod);
    }
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-80 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Doanh thu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tổng doanh thu: <span className="font-medium">{formattedTotalRevenue}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handlePeriodChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-4 flex-grow">
          <ErrorAlert message={error} />
        </div>
      ) : data.length === 0 ? (
        <div className="p-4 flex-grow flex items-center justify-center">
          <p className="text-gray-500">Không có dữ liệu doanh thu cho khoảng thời gian này</p>
        </div>
      ) : (
        <div className="p-4 h-80 flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

              <XAxis
                dataKey="name"
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />

              <YAxis
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = {
                    revenue: 'Doanh thu',
                    profit: 'Lợi nhuận',
                  };
                  return [formatTooltipValue(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Thời gian: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  const labels = {
                    revenue: 'Doanh thu',
                    profit: 'Lợi nhuận',
                  };
                  return labels[value] || value;
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6 }}
              />

              {data.some((item) => 'profit' in item) && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  activeDot={{ r: 6 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SalesChart;
