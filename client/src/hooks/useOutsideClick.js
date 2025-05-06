import { useEffect, useRef } from 'react';

/**
 * Custom hook để phát hiện click bên ngoài một element
 * @param {Function} callback - Hàm sẽ được gọi khi click bên ngoài
 * @returns {React.MutableRefObject} - Ref để gắn vào element cần theo dõi
 */
const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    // Thêm event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export default useOutsideClick;