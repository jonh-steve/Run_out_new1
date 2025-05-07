/**
 * File: src/components/layout/InfoLayout/index.js
 *
 * Layout cho các trang thông tin như Điều khoản sử dụng, Chính sách bảo mật,
 * Chính sách vận chuyển và Chính sách đổi trả.
 *
 * Layout này bao gồm Header chung, một sidebar điều hướng bên trái và Footer chung.
 * Nội dung chính của trang sẽ được hiển thị thông qua Outlet.
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';
import Header from '../Header';
import Footer from '../Footer';

const InfoLayout = () => {
  const location = useLocation();

  // Kiểm tra đường dẫn hiện tại để highlight menu item đang active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 flex flex-col md:flex-row">
        {/* Sidebar điều hướng */}
        <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin</h3>
            <nav className="space-y-2">
              <SidebarLink to={ROUTES.ABOUT} label="Giới thiệu" isActive={isActive(ROUTES.ABOUT)} />
              <SidebarLink
                to={ROUTES.CONTACT}
                label="Liên hệ"
                isActive={isActive(ROUTES.CONTACT)}
              />
              <SidebarLink
                to={ROUTES.TERMS}
                label="Điều khoản sử dụng"
                isActive={isActive(ROUTES.TERMS)}
              />
              <SidebarLink
                to={ROUTES.PRIVACY}
                label="Chính sách bảo mật"
                isActive={isActive(ROUTES.PRIVACY)}
              />
              <SidebarLink
                to={ROUTES.SHIPPING}
                label="Chính sách vận chuyển"
                isActive={isActive(ROUTES.SHIPPING)}
              />
              <SidebarLink
                to={ROUTES.RETURN}
                label="Chính sách đổi trả"
                isActive={isActive(ROUTES.RETURN)}
              />
              <SidebarLink
                to={ROUTES.FAQ}
                label="Câu hỏi thường gặp"
                isActive={isActive(ROUTES.FAQ)}
              />
            </nav>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
};

/**
 * Component link cho sidebar với trạng thái active
 */
const SidebarLink = ({ to, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {label}
    </Link>
  );
};

export default InfoLayout;
