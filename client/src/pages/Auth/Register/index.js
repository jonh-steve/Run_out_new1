// src/pages/Auth/Register/index.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';

import RegisterForm from '../../../components/feature/Auth/RegisterForm';
import { ROUTES } from '../../../routes/paths';

const RegisterPage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Nếu đã đăng nhập, chuyển hướng về trang chủ
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* <img
            className="mx-auto h-16 w-auto"
            src="/assets/images/logo.png"
            alt="RunOut-Biliard Logo"
          /> */}
          {/* <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Trở thành thành viên của RunOut-Biliard và nhận được nhiều ưu đãi hấp dẫn
          </p> */}
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>

        <div className="text-center text-xs text-gray-500">
          © 2025 RunOut-Biliard. Tất cả các quyền thuộc về Steve.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
