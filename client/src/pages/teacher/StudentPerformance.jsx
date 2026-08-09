import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentPerformance = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [section, setSection] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers/me').then((res) => {
      setSubjects(res.data.data.subjects || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/teachers/me/students', { params: { subject: subjectId || undefined, section: section || undefined, search: search || undefined } });
      setStudents(res.data.data);
    };
    load();
  }, [subjectId, section, search]);

  const viewPerformance = async (student) => {
    setSelected(student);
    const res = await api.get(`/students/${student._id}/performance`);
    setPerf(res.data.data);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Performance</h1>

      <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Subject</label>
          <select className="input-field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All my subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <input className="input-field" placeholder="e.g. A" value={section} onChange={(e) => setSection(e.target.value)} />
        </div>
        <div>
          <label className="label">Search (roll number)</label>
          <input className="input-field" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-x-auto">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Students ({students.length})</h2>
          <table className="w-full text-sm">
            <tbody>
              {students.map((s) => (
                <tr
                  key={s._id}
                  onClick={() => viewPerformance(s)}
                  className={`cursor-pointer border-b border-gray-50 dark:border-gray-700/50 ${selected?._id === s._id ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}
                >
                  <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{s.rollNumber}</td>
                  <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{s.user?.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.section}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-gray-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {selected ? `${selected.user?.name}'s Analytics` : 'Select a student to view analytics'}
          </h2>
          {perf && (
            <div className="space-y-6">
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={perf.attendanceSummary.map((a) => ({ name: a.subject.code, percentage: a.percentage }))}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marks</h3>
                <ul className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                  {perf.marks.map((m) => (
                    <li key={m._id} className="py-1.5 flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {m.subject?.name} ({m.examType})
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {m.marksObtained}/{m.totalMarks}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
