// src/components/layout/AdminLayout/index.js
// Component layout chính cho trang quản trị
// Bao gồm sidebar, header và kiểm tra quyền truy cập

import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { toggleSidebar } from '../../../store/slices/uiSlice';
import LoadingSpinner from '../../common/LoadingSpinner';

const AdminLayout = () => {
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra quyền admin khi component mount
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    }
  }, [user, isLoading, navigate, location]);

  // Xử lý toggle sidebar
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Lấy tên trang hiện tại từ path
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/products')) return 'Quản lý sản phẩm';
    if (path.includes('/admin/orders')) return 'Quản lý đơn hàng';
    if (path.includes('/admin/users')) return 'Quản lý người dùng';
    if (path.includes('/admin/categories')) return 'Quản lý danh mục';
    if (path.includes('/admin/reviews')) return 'Quản lý đánh giá';

    return 'Admin';
  };

  // Hiển thị loading khi đang kiểm tra quyền
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Hiển thị thông báo từ chối nếu không phải admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
        <p className="text-gray-700 mb-6">Bạn không có quyền truy cập vào trang quản trị</p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        pageTitle={getPageTitle()}
        openSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar cho màn hình lớn */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Sidebar cho màn hình nhỏ */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={handleToggleSidebar}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <AdminSidebar mobile onClose={handleToggleSidebar} />
            </div>
          </div>
        )}

        <main
          className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
        >
          {/* Nội dung chính */}
          <Outlet />

          {/* Watermark */}
          <div className="fixed bottom-4 right-4 text-gray-300 opacity-20 text-sm">
            © 2025 RunOut-Biliard. Steve
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
