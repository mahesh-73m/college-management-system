import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';
import Pagination from '../../components/Pagination.jsx';

const emptyForm = { name: '', email: '', password: '', rollNumber: '', department: '', course: '', semester: 1, section: 'A', admissionYear: new Date().getFullYear() };

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudents = async () => {
    const res = await api.get('/students', { params: { search: search || undefined, page, limit: 10 } });
    setStudents(res.data.data);
    setPages(res.data.pages);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStudents(), api.get('/admin/courses').then((r) => setCourses(r.data.data))]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student',
        profile: {
          rollNumber: form.rollNumber,
          department: form.department,
          course: form.course,
          semester: Number(form.semester),
          section: form.section,
          admissionYear: Number(form.admissionYear),
        },
      });
      setShowForm(false);
      setForm(emptyForm);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleDeactivate = async (student) => {
    if (!confirm(`Deactivate ${student.user?.name}?`)) return;
    await api.delete(`/admin/users/${student.user._id}`);
    loadStudents();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Students</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
          {error && <div className="sm:col-span-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <input required placeholder="Full name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input required placeholder="Roll number" className="input-field" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
          <input required placeholder="Department" className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <select required className="input-field" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input type="number" min={1} max={12} placeholder="Semester" className="input-field" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <input placeholder="Section" className="input-field" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
          <input type="number" placeholder="Admission year" className="input-field" value={form.admissionYear} onChange={(e) => setForm({ ...form, admissionYear: e.target.value })} />
          <button type="submit" className="btn-primary sm:col-span-3">
            Create Student
          </button>
        </form>
      )}

      <div className="card">
        <input placeholder="Search by roll number..." className="input-field mb-4 max-w-sm" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Roll No.</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Sem</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{s.rollNumber}</td>
                  <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{s.user?.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.department}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.course?.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.semester}</td>
                  <td className="py-2 pr-4">
                    <button onClick={() => handleDeactivate(s)} className="text-red-600 text-xs font-medium hover:underline">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </div>
  );
};

export default ManageStudents;
