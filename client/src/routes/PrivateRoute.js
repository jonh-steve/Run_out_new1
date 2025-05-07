import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { ROUTES } from './paths';

/**
 * @param {Object} props
 * @param {string} [props.requiredRole] - Vai trò yêu cầu để truy cập route
 */
const PrivateRoute = ({ requiredRole }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Nếu cần vai trò cụ thể và người dùng không có vai trò đó
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Người dùng đã đăng nhập (và có vai trò phù hợp nếu cần), cho phép truy cập
  return <Outlet />;
};

export default PrivateRoute;
