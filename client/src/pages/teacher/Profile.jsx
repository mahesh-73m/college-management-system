import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';
import AvatarUploader from '../../components/AvatarUploader.jsx';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers/me').then((res) => {
      setProfile(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  const rows = [
    ['Email', profile.user?.email],
    ['Employee ID', profile.employeeId],
    ['Department', profile.department],
    ['Designation', profile.designation],
    ['Phone', profile.phone || '—'],
    ['Assigned Subjects', profile.subjects?.map((s) => s.name).join(', ') || '—'],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Profile</h1>
      <div className="card max-w-2xl">
        <div className="mb-6">
          <AvatarUploader />
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default TeacherProfile;
