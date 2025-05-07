// src/pages/Profile/index.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../../store/slices/userSlice';
import MainLayout from '../../components/layout/MainLayout';
import UserProfile from '../../components/feature/User/UserProfile';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import ProfileSidebar from '../../components/feature/User/ProfileSidebar';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
          <div className="lg:col-span-3">
            {error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
            ) : (
              <UserProfile />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
