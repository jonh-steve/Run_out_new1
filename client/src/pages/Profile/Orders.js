// src/pages/Profile/Orders.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import UserOrders from '../../components/feature/User/UserOrders';
import ProfileSidebar from '../../components/feature/User/ProfileSidebar';

const OrdersPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
          <div className="lg:col-span-3">
            <UserOrders />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
