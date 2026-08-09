import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [attRes, marksRes, annRes] = await Promise.all([
        api.get('/students/me/attendance'),
        api.get('/students/me/marks'),
        api.get('/announcements'),
      ]);
      setAttendance(attRes.data.data);
      setMarks(marksRes.data.data);
      setAnnouncements(annRes.data.data.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const recentMarks = [...marks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Overall Attendance" value={`${attendance?.overallPercentage ?? 0}%`} icon="📅" />
        <StatCard label="Classes Attended" value={`${attendance?.totalPresent ?? 0}/${attendance?.totalClasses ?? 0}`} icon="✅" />
        <StatCard label="Subjects Graded" value={marks.length} icon="📈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Marks</h2>
          {recentMarks.length === 0 ? (
            <p className="text-sm text-gray-500">No marks uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentMarks.map((m) => (
                <li key={m._id} className="py-2 flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {m.subject?.name} <span className="text-gray-400">({m.examType})</span>
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {m.marksObtained}/{m.totalMarks} ({m.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a._id} className="text-sm">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{a.title}</p>
                  <p className="text-gray-500 dark:text-gray-400">{a.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
