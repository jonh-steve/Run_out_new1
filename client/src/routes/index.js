import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Lazy-loaded pages
const HomePage = lazy(() => import('../pages/Home'));
const ProductsPage = lazy(() => import('../pages/Products'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const CartPage = lazy(() => import('../pages/Cart'));
const CheckoutPage = lazy(() => import('../pages/Checkout'));
const CheckoutSuccessPage = lazy(() => import('../pages/Checkout/Success'));
const LoginPage = lazy(() => import('../pages/Auth/Login'));
const RegisterPage = lazy(() => import('../pages/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPassword'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const OrdersPage = lazy(() => import('../pages/Profile/Orders'));
const OrderDetailPage = lazy(() => import('../pages/Profile/OrderDetail'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/Admin/Dashboard'));
const AdminProductsPage = lazy(() => import('../pages/Admin/Products'));
const AdminProductFormPage = lazy(() => import('../pages/Admin/ProductForm'));
const AdminCategoriesPage = lazy(() => import('../pages/Admin/Categories'));
const AdminOrdersPage = lazy(() => import('../pages/Admin/Orders'));
const AdminUsersPage = lazy(() => import('../pages/Admin/Users'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={`${ROUTES.PRODUCTS}/:id`} element={<ProductDetailPage />} />
          <Route path={ROUTES.CART} element={<CartPage />} />

          {/* Protected routes within MainLayout */}
          <Route element={<PrivateRoute />}>
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route path={`${ROUTES.CHECKOUT}/success`} element={<CheckoutSuccessPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={`${ROUTES.PROFILE}/orders`} element={<OrdersPage />} />
            <Route path={`${ROUTES.PROFILE}/orders/:orderId`} element={<OrderDetailPage />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route element={<PublicRoute restricted />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
            <Route path={ROUTES.ADMIN_PRODUCT_ADD} element={<AdminProductFormPage />} />
            <Route path={ROUTES.ADMIN_PRODUCT_EDIT} element={<AdminProductFormPage />} />
            <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
            <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* Redirect for admin path */}
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />

        {/* 404 route */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
