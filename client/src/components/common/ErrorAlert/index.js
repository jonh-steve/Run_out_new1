// client/src/components/common/ErrorAlert/index.js
// Vị trí: Component hiển thị thông báo lỗi trong hệ thống, được sử dụng xuyên suốt ứng dụng
// Chức năng: Hiển thị thông báo lỗi với nút đóng (dismiss)

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Component hiển thị thông báo lỗi
 * @param {Object} props - Props của component
 * @param {string} props.message - Nội dung thông báo lỗi
 * @param {Function} props.onDismiss - Hàm xử lý khi người dùng đóng thông báo
 * @param {string} props.className - Class CSS bổ sung (nếu có)
 */
const ErrorAlert = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded-md ${className}`}>
      <div className="flex items-start">
        <div className="flex-grow">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex items-center justify-center"
            onClick={onDismiss}
            aria-label="Đóng"
          >
            <span className="sr-only">Đóng</span>
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
