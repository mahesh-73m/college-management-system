import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';

const EXAM_TYPES = ['Midterm', 'Final', 'Quiz', 'Assignment'];

const UploadMarks = () => {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [totalMarks, setTotalMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/teachers/me').then((res) => {
      setSubjects(res.data.data.subjects || []);
      if (res.data.data.subjects?.length) setSubject(res.data.data.subjects[0]._id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!subject) return;
    const load = async () => {
      const [studentsRes, marksRes] = await Promise.all([
        api.get('/teachers/me/students', { params: { subject } }),
        api.get('/marks', { params: { subject, examType } }),
      ]);
      setStudents(studentsRes.data.data);
      const map = {};
      marksRes.data.data.forEach((m) => (map[m.student._id] = m.marksObtained));
      setScores(map);
    };
    load();
  }, [subject, examType]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = students
        .filter((s) => scores[s._id] !== undefined && scores[s._id] !== '')
        .map((s) => ({ student: s._id, marksObtained: Number(scores[s._id]) }));

      if (records.length === 0) {
        setMessage('Enter at least one score before saving.');
        setSaving(false);
        return;
      }

      await api.post('/marks/bulk', { subject, examType, totalMarks: Number(totalMarks), records });
      setMessage('Marks saved successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Marks</h1>

      <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Subject</label>
          <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Exam Type</label>
          <select className="input-field" value={examType} onChange={(e) => setExamType(e.target.value)}>
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Total Marks</label>
          <input type="number" min={1} className="input-field" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
        </div>
      </div>

      {message && <div className="text-sm text-primary-600 bg-primary-50 dark:bg-primary-500/10 px-3 py-2 rounded-lg">{message}</div>}

      <div className="card overflow-x-auto">
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">No students found for this subject.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Roll No.</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Marks Obtained</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{s.rollNumber}</td>
                  <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{s.user?.name}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={totalMarks}
                      className="input-field !py-1 w-24"
                      value={scores[s._id] ?? ''}
                      onChange={(e) => setScores({ ...scores, [s._id]: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {students.length > 0 && (
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Marks'}
        </button>
      )}
    </div>
  );
};

export default UploadMarks;
