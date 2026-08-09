import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';
import Pagination from '../../components/Pagination.jsx';

const emptyForm = { name: '', email: '', password: '', employeeId: '', department: '', designation: 'Assistant Professor' };

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/teachers', { params: { search: search || undefined, page, limit: 10 } });
    setTeachers(res.data.data);
    setPages(res.data.pages);
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
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
        role: 'teacher',
        profile: { employeeId: form.employeeId, department: form.department, designation: form.designation },
      });
      setShowForm(false);
      setForm(emptyForm);
      setPage(1);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher');
    }
  };

  const handleDeactivate = async (teacher) => {
    if (!confirm(`Deactivate ${teacher.user?.name}?`)) return;
    await api.delete(`/admin/users/${teacher.user._id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Teachers</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Teacher'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
          {error && <div className="sm:col-span-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <input required placeholder="Full name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input required placeholder="Employee ID" className="input-field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          <input required placeholder="Department" className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input placeholder="Designation" className="input-field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <button type="submit" className="btn-primary sm:col-span-3">
            Create Teacher
          </button>
        </form>
      )}

      <div className="card">
        <input
          placeholder="Search by employee ID..."
          className="input-field mb-4 max-w-sm"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Employee ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Subjects</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{t.employeeId}</td>
                  <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{t.user?.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{t.department}</td>
                  <td className="py-2 pr-4 text-gray-500">{t.subjects?.map((s) => s.name).join(', ') || '—'}</td>
                  <td className="py-2 pr-4">
                    <button onClick={() => handleDeactivate(t)} className="text-red-600 text-xs font-medium hover:underline">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No teachers found.
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

export default ManageTeachers;
