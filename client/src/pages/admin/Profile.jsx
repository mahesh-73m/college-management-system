import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import AvatarUploader from '../../components/AvatarUploader.jsx';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Profile</h1>
      <div className="card max-w-2xl">
        <div className="mb-6">
          <AvatarUploader />
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Email</dt>
            <dd className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Role</dt>
            <dd className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default AdminProfile;
