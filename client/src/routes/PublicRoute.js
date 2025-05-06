import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { ROUTES } from './paths';

/**
 * @param {Object} props
 * @param {boolean} [props.restricted=false] - Nếu true, người dùng đã đăng nhập sẽ được chuyển hướng
 */
const PublicRoute = ({ restricted = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  
  // Lấy đường dẫn chuyển hướng từ location state hoặc sử dụng trang chủ làm mặc định
  const from = location.state?.from || { pathname: ROUTES.HOME };
  
  // Nếu route bị hạn chế và người dùng đã đăng nhập, chuyển hướng đến đường dẫn trước đó
  if (restricted && isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  // Route không bị hạn chế, hoặc người dùng chưa đăng nhập, cho phép truy cập
  return <Outlet />;
};

export default PublicRoute;