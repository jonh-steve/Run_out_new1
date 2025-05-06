import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/images/logo.png';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/">
            <img className="mx-auto h-16 w-auto" src={Logo} alt="RunOut-Biliard Logo" />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">RunOut-Biliard</h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
