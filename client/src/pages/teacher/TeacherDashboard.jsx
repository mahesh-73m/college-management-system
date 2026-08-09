import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';

const TeacherDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/teachers/me'), api.get('/teachers/me/attendance-logs')]).then(([p, l]) => {
      setProfile(p.data.data);
      setLogs(l.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome, {profile.user?.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Assigned Subjects" value={profile.subjects?.length || 0} icon="📚" />
        <StatCard label="Department" value={profile.department} icon="🏛" />
        <StatCard label="Designation" value={profile.designation} icon="🎓" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Assigned Classes</h2>
          {profile.subjects?.length === 0 ? (
            <p className="text-sm text-gray-500">No subjects assigned yet. Contact your admin.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {profile.subjects.map((s) => (
                <li key={s._id} className="py-2 text-sm flex justify-between">
                  <span className="text-gray-800 dark:text-gray-200">{s.name}</span>
                  <span className="text-gray-500">{s.course?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Attendance Logs</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">No attendance marked yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.slice(0, 8).map((l) => (
                <li key={l._id} className="py-2 text-sm flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {l.student?.user?.name} — {l.subject?.name}
                  </span>
                  <span className={l.status === 'present' ? 'text-green-600' : 'text-red-600'}>{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
