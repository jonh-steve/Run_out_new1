// File: client/src/App.js
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoadingSpinner from './components/common/LoadingSpiner/index.js';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { ROUTES } from './routes/paths';
// Lazy-loaded pages
const HomePage = React.lazy(() => import('./pages/Home'));
const LoginPage = React.lazy(() => import('./pages/Auth/Login'));
const RegisterPage = React.lazy(() => import('./pages/Auth/Register'));
const NotFoundPage = React.lazy(() => import('./pages/NotFound'));

// Watermark
const Watermark = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <div className="absolute bottom-4 right-4 opacity-30 text-gray-500 font-bold rotate-330 select-none pointer-events-none">
        &copy; Steve
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Watermark>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route
              path={ROUTES.LOGIN}
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
              path={ROUTES.REGISTER}
              element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
            />
          </Route>

          {/* 404 route */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
        </Routes>
      </Suspense>
    </Watermark>
  );
}

export default App;
