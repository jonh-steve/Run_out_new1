// src/components/feature/Admin/Dashboard/index.js
// Vị trí: File xuất các component từ thư mục Dashboard để dễ dàng import từ các nơi khác trong dự án
// Các component này được sử dụng trong trang Dashboard của Admin

import DashboardStats from './DashboardStats';
import RecentOrders from './RecentOrders';
import SalesChart from './SalesChart';
import TimeFilter from './TimeFilter';

// Xuất tất cả các component
export { DashboardStats, RecentOrders, SalesChart, TimeFilter };

// Xuất mặc định tất cả các component dưới dạng một object
export default {
  DashboardStats,
  RecentOrders,
  SalesChart,
  TimeFilter,
};
