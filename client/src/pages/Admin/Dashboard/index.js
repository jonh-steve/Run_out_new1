// src/pages/Admin/Dashboard/index.js
// Vị trí: Trang Dashboard chính cho Admin, hiển thị thống kê, biểu đồ và đơn hàng gần đây

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchDashboardStats,
  fetchRecentOrders,
  clearError,
} from '../../../store/slices/adminSlice';
import {
  DashboardStats,
  RecentOrders,
  SalesChart,
  TimeFilter,
} from '../../../components/feature/Admin/Dashboard';
import { LoadingSpinner, ErrorAlert, RefreshButton } from '../../../components/common';

const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};
import { unwrapResult } from '@reduxjs/toolkit';
const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { stats, recentOrders, isLoading, error } = useAppSelector((state) => state.admin);

  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.WEEK);

  const fetchDashboardData = useCallback(async () => {
    const result = await dispatch(fetchDashboardStats(timePeriod));
    const data = unwrapResult(result);
    // Sử dụng data
  }, [dispatch, timePeriod]);
  useEffect(() => {
    fetchDashboardData();

    // Cleanup function để reset errors khi unmount
    return () => {
      dispatch(clearError());
    };
  }, [fetchDashboardData, dispatch]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleTimeFilterChange = (period) => {
    setTimePeriod(period);
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <TimeFilter
            currentPeriod={timePeriod}
            onChange={handleTimeFilterChange}
            options={TIME_PERIODS}
          />
          <RefreshButton onClick={handleRefresh} isLoading={isLoading} />
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={handleDismissError} />}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <DashboardStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Doanh số bán hàng</h2>
              <SalesChart data={stats?.salesData || []} period={timePeriod} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Đơn hàng gần đây</h2>
              <RecentOrders
                orders={recentOrders}
                isLoading={isLoading}
                onViewAllClick={() => {
                  /* Navigate to orders page */
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm bán chạy</h2>
              {/* Component hiển thị sản phẩm bán chạy */}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h2>
              {/* Component hiển thị hoạt động gần đây */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
