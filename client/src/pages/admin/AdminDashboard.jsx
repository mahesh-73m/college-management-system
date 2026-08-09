import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => {
      setData(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} icon="🎓" />
        <StatCard label="Total Teachers" value={data.totalTeachers} icon="👩‍🏫" />
        <StatCard label="Courses" value={data.totalCourses} icon="📘" />
        <StatCard label="Overall Attendance" value={`${data.overallAttendancePercentage}%`} icon="📊" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500">No recent attendance activity.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.recentActivity.map((a) => (
              <li key={a._id} className="py-2 text-sm flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {a.student?.user?.name} — {a.subject?.name}
                </span>
                <span className={a.status === 'present' ? 'text-green-600' : 'text-red-600'}>
                  {a.status} • {new Date(a.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
