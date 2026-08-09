import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';

const StudentAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me/attendance').then((res) => {
      setData(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Attendance</h1>
        <div className="card !p-3 text-sm">
          Overall: <span className="font-semibold text-primary-600">{data.overallPercentage}%</span> ({data.totalPresent}/{data.totalClasses})
        </div>
      </div>

      <div className="grid gap-4">
        {data.subjectWise.length === 0 && <p className="text-sm text-gray-500">No attendance records yet.</p>}
        {data.subjectWise.map((s) => (
          <div key={s.subject._id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{s.subject.name}</h3>
                <p className="text-xs text-gray-400">{s.subject.code}</p>
              </div>
              <span
                className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                  s.percentage >= 75
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                }`}
              >
                {s.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${s.percentage}%` }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.history.slice(0, 20).map((h, i) => (
                <span
                  key={i}
                  title={new Date(h.date).toLocaleDateString()}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium ${
                    h.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  }`}
                >
                  {h.status === 'present' ? 'P' : 'A'}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
