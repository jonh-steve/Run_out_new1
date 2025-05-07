// src/pages/Profile/OrderDetail.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import OrderDetail from '../../components/feature/User/OrderDetail';
import ProfileSidebar from '../../components/feature/User/ProfileSidebar';

const OrderDetailPage = () => {
  const { orderId } = useParams();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/profile/orders" className="text-blue-600 hover:text-blue-800 mr-2">
            ← Quay lại
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
          <div className="lg:col-span-3">
            <OrderDetail />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
