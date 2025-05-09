// src/components/feature/User/UserProfile.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../../store/slices/userSlice';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Vui lòng nhập họ tên'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  phone: yup.string(),
  address: yup.string(),
});

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.street || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) {
    return <div className="text-center p-4">Đang tải thông tin...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Input label="Họ tên" {...register('name')} error={errors.name?.message} />
            </div>
            <div>
              <Input label="Email" {...register('email')} error={errors.email?.message} disabled />
            </div>
            <div>
              <Input label="Số điện thoại" {...register('phone')} error={errors.phone?.message} />
            </div>
            <div>
              <Input label="Địa chỉ" {...register('address')} error={errors.address?.message} />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 mb-1">Họ tên</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Số điện thoại</p>
            <p className="font-medium">{user.phone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Địa chỉ</p>
            <p className="font-medium">{user.address?.street || 'Chưa cập nhật'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
