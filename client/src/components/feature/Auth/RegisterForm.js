// Vị trí file: client/src/components/feature/Auth/RegisterForm.js
// Component form đăng ký với chức năng bật tắt hiển thị mật khẩu cải tiến
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaInfoCircle,
} from 'react-icons/fa';

import { Input, Button } from '../../../components/common';

import authService from '../../../services/authService';
import { login } from '../../../store/slices/authSlice';
import { ROUTES } from '../../../routes/paths';

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng để tiếp tục');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API đăng ký
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setSuccess('Đăng ký thành công! Đang chuyển hướng...');

      // Lưu thông tin đăng nhập vào Redux
      dispatch(
        login({
          user: response.user,
          token: response.token,
        })
      );

      // Chuyển hướng đến trang chủ sau 1.5 giây
      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Xử lý đăng nhập bằng mạng xã hội (sẽ triển khai sau)
    console.log(`Đăng nhập với ${provider}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Kiểm tra độ mạnh của mật khẩu
  const getPasswordStrength = (password) => {
    if (!password) return null;

    let strength = 0;

    // Độ dài tối thiểu
    if (password.length >= 8) strength += 1;

    // Có chữ thường
    if (/[a-z]/.test(password)) strength += 1;

    // Có chữ hoa
    if (/[A-Z]/.test(password)) strength += 1;

    // Có số
    if (/[0-9]/.test(password)) strength += 1;

    // Có ký tự đặc biệt
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const renderPasswordStrength = (password) => {
    const strength = getPasswordStrength(password);

    if (!strength) return null;

    const strengthText = {
      1: 'Rất yếu',
      2: 'Yếu',
      3: 'Trung bình',
      4: 'Mạnh',
      5: 'Rất mạnh',
    };

    const strengthColor = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-green-500',
      5: 'bg-green-600',
    };

    return (
      <div className="mt-2">
        <div className="flex items-center mb-1">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-full ${index < strength ? strengthColor[strength] : 'bg-gray-200'}`}
                style={{ width: '20%', float: 'left' }}
              ></div>
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-600">{strengthText[strength]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
        <p className="text-gray-600 mt-1">Điền thông tin để đăng ký tài khoản</p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant="outline"
          className="flex-1 flex justify-center items-center"
          onClick={() => handleSocialLogin('Google')}
        >
          <FaGoogle className="mr-2" /> Google
        </Button>
        <Button
          variant="outline"
          className="flex-1 flex justify-center items-center"
          onClick={() => handleSocialLogin('Facebook')}
        >
          <FaFacebook className="mr-2" /> Facebook
        </Button>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-gray-300 flex-grow"></div>
        <span className="px-3 text-sm text-gray-500 bg-white">hoặc đăng ký với email</span>
        <div className="border-t border-gray-300 flex-grow"></div>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Input
            id="name"
            type="text"
            placeholder="Họ và tên"
            leftIcon={<FaUser className="text-gray-400" />}
            {...register('name', {
              required: 'Vui lòng nhập họ và tên',
              minLength: {
                value: 3,
                message: 'Tên phải có ít nhất 3 ký tự',
              },
            })}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            leftIcon={<FaEnvelope className="text-gray-400" />}
            {...register('email', {
              required: 'Vui lòng nhập email',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Email không hợp lệ',
              },
            })}
            error={errors.email?.message}
          />
        </div>

        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              leftIcon={<FaLock className="text-gray-400" />}
              rightIcon={
                <div
                  onClick={togglePasswordVisibility}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              }
              {...register('password', {
                required: 'Vui lòng nhập mật khẩu',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                  message:
                    'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số',
                },
              })}
              error={errors.password?.message}
            />
          </div>

          {password && renderPasswordStrength(password)}

          {password && !errors.password && (
            <div className="mt-1 flex items-center text-xs text-green-600">
              <FaInfoCircle className="mr-1" />
              <span>Mật khẩu hợp lệ</span>
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Xác nhận mật kh��u"
              leftIcon={<FaLock className="text-gray-400" />}
              rightIcon={
                <div
                  onClick={toggleConfirmPasswordVisibility}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              }
              {...register('confirmPassword', {
                required: 'Vui lòng xác nhận mật khẩu',
                validate: (value) => value === password || 'Mật khẩu không khớp',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            Tôi đồng ý với{' '}
            <Link to={ROUTES.TERMS} className="text-blue-600 hover:text-blue-500">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link to={ROUTES.PRIVACY} className="text-blue-600 hover:text-blue-500">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full py-3 font-medium"
            isLoading={loading}
            disabled={!agreeTerms}
          >
            Đăng ký
          </Button>
        </div>

        <div className="text-sm text-center mt-6">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
