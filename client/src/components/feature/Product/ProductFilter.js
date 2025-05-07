// client/src/components/feature/Product/ProductFilter.js

import React, { useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';

const ProductFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brand: '',
    inStock: false,
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Gọi onFilterChange khi filters thay đổi
  React.useEffect(() => {
    onFilterChange(debouncedFilters);
  }, [debouncedFilters, onFilterChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-bold mb-4">Lọc Sản Phẩm</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Khoảng Giá</label>
        <div className="flex space-x-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Từ"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Đến"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Thương Hiệu</label>
        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Tất cả</option>
          <option value="ProCue">ProCue</option>
          <option value="StarterCue">StarterCue</option>
          <option value="MasterBall">MasterBall</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="inStock"
            checked={filters.inStock}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm">Chỉ hiển thị sản phẩm còn hàng</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilter;
