// src/components/layout/AdminLayout/AdminSidebar.js
// Component sidebar cho trang quản trị
// Hỗ trợ cả chế độ mobile và desktop, có thể thu gọn/mở rộng

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { toggleSidebar } from '../../../store/slices/uiSlice';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  StarIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ mobile, onClose }) => {
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: HomeIcon },
    { name: 'Sản phẩm', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Danh mục', path: '/admin/categories', icon: TagIcon },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ClipboardDocumentListIcon },
    { name: 'Người dùng', path: '/admin/users', icon: UserGroupIcon },
    { name: 'Đánh giá', path: '/admin/reviews', icon: StarIcon },
    { name: 'Báo cáo', path: '/admin/reports', icon: ChartBarIcon },
    { name: 'Cài đặt', path: '/admin/settings', icon: Cog6ToothIcon },
  ];

  // Xử lý hiển thị cho mobile
  if (mobile) {
    return (
      <div className="flex flex-col h-full bg-gray-800 w-64">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white font-bold text-xl">Admin Panel</h2>
          <button type="button" className="text-gray-300 hover:text-white" onClick={onClose}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`
                  }
                  end={item.path === '/admin'}
                  onClick={mobile ? onClose : undefined}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <NavLink
            to="/"
            className="text-gray-300 hover:text-white group flex items-center px-2 py-2 text-base font-medium rounded-md"
            onClick={mobile ? onClose : undefined}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
            Quay lại trang chủ
          </NavLink>
        </div>
      </div>
    );
  }

  // Hiển thị cho desktop
  return (
    <aside
      className={`fixed top-16 left-0 z-30 h-screen transition-all duration-300 bg-gray-800 text-white ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-full flex flex-col justify-between py-4">
        {isSidebarOpen && (
          <div className="flex items-center px-4 py-2 mb-4">
            <img className="h-8" src="/logo.png" alt="RunOut-Biliard" />
            <h2 className="ml-3 text-white font-bold text-lg">Admin Panel</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-lg transition-all ${
                        isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`
                    }
                    end={item.path === '/admin'}
                    title={!isSidebarOpen ? item.name : undefined}
                  >
                    <Icon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isSidebarOpen && (
                      <span className="transition-opacity duration-300">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 px-3">
          {isSidebarOpen && (
            <NavLink
              to="/"
              className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-lg mb-4"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
              <span>Quay lại trang chủ</span>
            </NavLink>
          )}

          <button
            className="w-full flex items-center justify-center p-2 text-gray-400 rounded-lg hover:bg-gray-700"
            onClick={handleToggleSidebar}
          >
            {isSidebarOpen ? (
              <>
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="ml-2">Thu gọn</span>
              </>
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
