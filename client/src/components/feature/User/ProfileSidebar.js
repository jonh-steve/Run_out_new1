// src/components/feature/User/ProfileSidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProfileSidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const menuItems = [
    {
      path: '/profile',
      label: 'Thông tin tài khoản',
      icon: '👤',
      exact: true,
    },
    {
      path: '/profile/orders',
      label: 'Đơn hàng của tôi',
      icon: '📦',
      exact: false,
    },
    {
      path: '/profile/reviews',
      label: 'Đánh giá của tôi',
      icon: '⭐',
      exact: true,
    },
    {
      path: '/profile/wishlist',
      label: 'Sản phẩm yêu thích',
      icon: '❤️',
      exact: true,
    },
    {
      path: '/profile/settings',
      label: 'Cài đặt tài khoản',
      icon: '⚙️',
      exact: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {user && (
        <div className="p-6 border-b">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="py-2">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-gray-50 ${
                isActive ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSidebar;
