import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce một giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms)
 * @returns {any} - Giá trị đã debounce
 */
const useDebounce = (value, delay) => {
  // State và setter cho giá trị debounced
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Cập nhật giá trị debounced sau một khoảng thời gian delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timeout nếu value thay đổi hoặc unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
