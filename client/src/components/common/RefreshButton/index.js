// client/src/components/common/RefreshButton/index.js
// Vị trí: Component nút làm mới dữ liệu, được sử dụng trong các trang cần tải lại dữ liệu
// Chức năng: Hiển thị nút làm mới với trạng thái loading khi đang tải dữ liệu

import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Component nút làm mới dữ liệu
 * @param {Object} props - Props của component
 * @param {Function} props.onClick - Hàm xử lý khi người dùng nhấn nút làm mới
 * @param {boolean} props.isLoading - Trạng thái đang tải dữ liệu
 * @param {string} props.className - Class CSS bổ sung (nếu có)
 * @param {string} props.size - Kích thước nút (sm, md, lg)
 */
const RefreshButton = ({ onClick, isLoading = false, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2',
    lg: 'p-2.5 text-lg',
  };

  const buttonSize = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center ${buttonSize} bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      onClick={onClick}
      disabled={isLoading}
      aria-label="Làm mới dữ liệu"
    >
      <ArrowPathIcon
        className={`h-5 w-5 ${isLoading ? 'animate-spin text-blue-600' : 'text-gray-500'}`}
      />
      <span className="sr-only">Làm mới</span>
    </button>
  );
};

export default RefreshButton;
