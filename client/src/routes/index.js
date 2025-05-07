import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoadingSpinner from '../components/common/LoadingSpiner';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import InfoLayout from '../components/layout/InfoLayout';

// Lazy-loaded Customer pages
const HomePage = lazy(() => import('../pages/Home'));
const ProductsPage = lazy(() => import('../pages/Products'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const CartPage = lazy(() => import('../pages/Cart'));
const CheckoutPage = lazy(() => import('../pages/Checkout'));
const CheckoutSuccessPage = lazy(() => import('../pages/Checkout/Success'));
// const WishlistPage = lazy(() => import('../pages/Wishlist'));
// const ComparePage = lazy(() => import('../pages/Compare'));

// Auth pages
const LoginPage = lazy(() => import('../pages/Auth/Login'));
const RegisterPage = lazy(() => import('../pages/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPassword'));
const VerifyEmailPage = lazy(() => import('../pages/Auth/VerifyEmail'));

// Profile pages
const ProfilePage = lazy(() => import('../pages/Profile'));
const ProfileInfoPage = lazy(() => import('../pages/Profile/Info'));
const ProfileAddressesPage = lazy(() => import('../pages/Profile/Addresses'));
const ProfilePasswordPage = lazy(() => import('../pages/Profile/Password'));
const OrdersPage = lazy(() => import('../pages/Profile/Orders'));
const OrderDetailPage = lazy(() => import('../pages/Profile/OrderDetail'));
const ReviewsPage = lazy(() => import('../pages/Profile/Reviews'));

// Info pages
// const AboutPage = lazy(() => import('../pages/Info/About'));
// const ContactPage = lazy(() => import('../pages/Info/Contact'));
// const TermsPage = lazy(() => import('../pages/Info/Terms'));
// const PrivacyPage = lazy(() => import('../pages/Info/Privacy'));
// const ShippingPage = lazy(() => import('../pages/Info/Shipping'));
// const ReturnPage = lazy(() => import('../pages/Info/Return'));
// const FAQPage = lazy(() => import('../pages/Info/FAQ'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/Admin/Dashboard'));
const AdminProductsPage = lazy(() => import('../pages/Admin/Products'));
const AdminProductFormPage = lazy(() => import('../pages/Admin/ProductForm'));
const AdminCategoriesPage = lazy(() => import('../pages/Admin/Categories'));
const AdminCategoryFormPage = lazy(() => import('../pages/Admin/CategoryForm'));
const AdminOrdersPage = lazy(() => import('../pages/Admin/Orders'));
const AdminOrderDetailPage = lazy(() => import('../pages/Admin/OrderDetail'));
const AdminUsersPage = lazy(() => import('../pages/Admin/Users'));
const AdminUserFormPage = lazy(() => import('../pages/Admin/UserForm'));
const AdminReviewsPage = lazy(() => import('../pages/Admin/Reviews'));
const AdminSettingsPage = lazy(() => import('../pages/Admin/Settings'));
const AdminReportsPage = lazy(() => import('../pages/Admin/Reports'));

// Error pages
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const ErrorPage = lazy(() => import('../pages/Error'));
const MaintenancePage = lazy(() => import('../pages/Maintenance'));

/**
 * Cấu hình routing chính của ứng dụng
 * Phân chia thành các nhóm route:
 * - Public routes: Có th��� truy cập không cần đăng nhập
 * - Protected routes: Yêu cầu đăng nhập
 * - Auth routes: Đăng nhập, đăng ký, quên mật khẩu
 * - Admin routes: Yêu cầu quyền admin
 * - Info routes: Các trang thông tin
 * - Error routes: Xử lý lỗi và trang không tìm thấy
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Đang tải..." />}>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          {/* Trang chủ và sản phẩm */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={`${ROUTES.PRODUCTS}/:id`} element={<ProductDetailPage />} />
          <Route path={ROUTES.CART} element={<CartPage />} />
          <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
          <Route path={ROUTES.COMPARE} element={<ComparePage />} />

          {/* Protected routes within MainLayout */}
          <Route element={<PrivateRoute />}>
            {/* Thanh toán */}
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route path={`${ROUTES.CHECKOUT}/success`} element={<CheckoutSuccessPage />} />

            {/* Hồ sơ người dùng */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />}>
              <Route index element={<ProfileInfoPage />} />
              <Route path="addresses" element={<ProfileAddressesPage />} />
              <Route path="password" element={<ProfilePasswordPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>

            {/* Đơn hàng */}
            <Route path={`${ROUTES.PROFILE}/orders`} element={<OrdersPage />} />
            <Route path={`${ROUTES.PROFILE}/orders/:orderId`} element={<OrderDetailPage />} />
          </Route>

          {/* Trang thông tin */}
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.CONTACT} element={<ContactPage />} />
          <Route path={ROUTES.FAQ} element={<FAQPage />} />
        </Route>

        {/* Info routes with InfoLayout */}
        <Route element={<InfoLayout />}>
          <Route path={ROUTES.TERMS} element={<TermsPage />} />
          <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
          <Route path={ROUTES.SHIPPING} element={<ShippingPage />} />
          <Route path={ROUTES.RETURN} element={<ReturnPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route element={<PublicRoute restricted />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard */}
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />

            {/* Quản lý sản phẩm */}
            <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
            <Route path={ROUTES.ADMIN_PRODUCT_ADD} element={<AdminProductFormPage />} />
            <Route path={ROUTES.ADMIN_PRODUCT_EDIT} element={<AdminProductFormPage />} />

            {/* Quản lý danh mục */}
            <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
            <Route path={`${ROUTES.ADMIN_CATEGORIES}/add`} element={<AdminCategoryFormPage />} />
            <Route
              path={`${ROUTES.ADMIN_CATEGORIES}/:id/edit`}
              element={<AdminCategoryFormPage />}
            />

            {/* Quản lý đơn hàng */}
            <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
            <Route path={`${ROUTES.ADMIN_ORDERS}/:id`} element={<AdminOrderDetailPage />} />

            {/* Qu��n lý người dùng */}
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={`${ROUTES.ADMIN_USERS}/add`} element={<AdminUserFormPage />} />
            <Route path={`${ROUTES.ADMIN_USERS}/:id/edit`} element={<AdminUserFormPage />} />

            {/* Quản lý đánh giá */}
            <Route path={ROUTES.ADMIN_REVIEWS} element={<AdminReviewsPage />} />

            {/* Cài đặt và báo cáo */}
            <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
            <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
          </Route>
        </Route>

        {/* Redirect for admin path */}
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />

        {/* Error routes */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path={ROUTES.ERROR} element={<ErrorPage />} />
        <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
