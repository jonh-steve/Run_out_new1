import { useState, useEffect } from 'react';

/**
 * Custom hook để sử dụng localStorage
 * @param {string} key - Key để lưu trong localStorage
 * @param {any} initialValue - Giá trị ban đầu
 * @returns {Array} [storedValue, setValue]
 */
const useLocalStorage = (key, initialValue) => {
  // Tạo state ban đầu
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Lấy giá trị từ localStorage
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Nếu có lỗi, trả về giá trị ban đầu
      console.error(`Error getting localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Hàm để cập nhật localStorage và state
  const setValue = (value) => {
    try {
      // Cho phép value là một function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Lưu state
      setStoredValue(valueToStore);
      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Đồng bộ với các tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    // Lắng nghe sự kiện storage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage;
