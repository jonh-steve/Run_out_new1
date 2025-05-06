import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logout } from '../../../store/slices/authSlice';
import { ROUTES } from '../../../routes/paths';
import Logo from '../../../assets/images/logo.png';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-blue-900 text-white shadow-md">
      <div className="content-wrapper py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center">
            <img src={Logo} alt="RunOut-Biliard" className="h-10 w-auto mr-2" />
            <span className="font-bold text-xl">RunOut-Biliard</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to={ROUTES.HOME} className="px-3 py-2 rounded hover:bg-blue-800">
              Trang chủ
            </Link>
            <Link to={ROUTES.PRODUCTS} className="px-3 py-2 rounded hover:bg-blue-800">
              Sản phẩm
            </Link>
            {isAuthenticated ? (
              <>
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 rounded hover:bg-blue-800">
                    {user?.name || 'Tài khoản'}
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg invisible group-hover:visible z-10">
                    <div className="py-1">
                      <Link
                        to={ROUTES.PROFILE}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Hồ sơ
                      </Link>
                      <Link
                        to={ROUTES.ORDERS}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Đơn hàng
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
                <Link to={ROUTES.CART} className="px-3 py-2 rounded hover:bg-blue-800">
                  Giỏ hàng
                </Link>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="px-3 py-2 rounded hover:bg-blue-800">
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-3 py-2 bg-blue-700 rounded hover:bg-blue-600"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 pt-4 border-t border-blue-800 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link
                to={ROUTES.HOME}
                className="px-3 py-2 rounded hover:bg-blue-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="px-3 py-2 rounded hover:bg-blue-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={ROUTES.PROFILE}
                    className="px-3 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    to={ROUTES.ORDERS}
                    className="px-3 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <Link
                    to={ROUTES.CART}
                    className="px-3 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giỏ hàng
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded hover:bg-blue-800 text-left"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className="px-3 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-3 py-2 bg-blue-700 rounded hover:bg-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
