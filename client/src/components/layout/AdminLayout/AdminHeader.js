// src/components/layout/AdminLayout/AdminHeader.js
// Component header cho trang quản trị
// Hiển thị logo, tiêu đề trang, thông báo và menu người dùng

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { BellIcon, UserCircleIcon, Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';

const AdminHeader = ({ openSidebar, pageTitle }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          {/* Nút mở sidebar trên mobile */}
          <button
            type="button"
            className="md:hidden p-2 mr-2 text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={openSidebar}
          >
            <span className="sr-only">Mở menu</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo và tên trang */}
          <Link to="/admin" className="flex items-center">
            <img src="/assets/logo.png" alt="RunOut Biliard" className="h-8 w-auto" />
            <span className="ml-3 text-xl font-bold text-gray-900 hidden md:block">
              Admin Portal
            </span>
          </Link>

          {/* Tiêu đề trang */}
          {pageTitle && (
            <div className="hidden md:block ml-6 pl-6 border-l border-gray-200">
              <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Thông báo */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleNotification}
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                3
              </span>
            </button>

            {/* Dropdown thông báo */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 font-medium border-b">Thông báo mới</div>
                <div className="max-h-60 overflow-y-auto">
                  <Link
                    to="/admin/orders/123"
                    className="block px-4 py-3 hover:bg-gray-50 border-b"
                  >
                    <p className="text-sm font-medium text-gray-900">Đơn hàng mới #123</p>
                    <p className="text-xs text-gray-500">15 phút trước</p>
                  </Link>
                  <Link
                    to="/admin/reviews/456"
                    className="block px-4 py-3 hover:bg-gray-50 border-b"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Đánh giá mới từ Nguyễn Văn A
                    </p>
                    <p className="text-xs text-gray-500">2 giờ trước</p>
                  </Link>
                  <Link to="/admin/products/789" className="block px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Sản phẩm XYZ sắp hết hàng</p>
                    <p className="text-xs text-gray-500">1 ngày trước</p>
                  </Link>
                </div>
                <Link
                  to="/admin/notifications"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 py-2 border-t"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </div>

          {/* Menu người dùng */}
          <div className="relative">
            <button
              className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="ml-2 hidden md:block">{user?.name || 'Admin'}</span>
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </button>

            {/* Dropdown menu người dùng */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  Đăng nhập với <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Hồ sơ
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Cài đặt
                </Link>
                <div className="border-t mt-1"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
