// src/components/feature/Admin/Dashboard/TimeFilter.js
// Vị trí: Component lọc thời gian cho Dashboard Admin, cho phép người dùng chọn khoảng thời gian
// để hiển thị dữ liệu (hôm nay, tuần, tháng, năm)

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component cho phép lọc dữ liệu theo khoảng thời gian
 * @param {Object} props - Props của component
 * @param {string} props.currentPeriod - Khoảng thời gian hiện tại đang được chọn
 * @param {Function} props.onChange - Hàm xử lý khi thay đổi khoảng thời gian
 * @param {Object} props.options - Các tùy chọn khoảng thời gian có sẵn
 */
const TimeFilter = ({ currentPeriod, onChange, options }) => {
  // Danh sách các tùy chọn hiển thị
  const displayOptions = [
    { value: options.TODAY, label: 'Hôm nay' },
    { value: options.WEEK, label: 'Tuần này' },
    { value: options.MONTH, label: 'Tháng này' },
    { value: options.YEAR, label: 'Năm nay' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Khoảng thời gian:</span>
      <div className="flex space-x-1">
        {displayOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentPeriod === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-current={currentPeriod === option.value ? 'page' : undefined}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

TimeFilter.propTypes = {
  currentPeriod: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
};

export default TimeFilter;
