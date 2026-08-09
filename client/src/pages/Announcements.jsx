import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Shared announcements page. Admin and teachers can post; everyone can read.
const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' });
  const [loading, setLoading] = useState(true);
  const canPost = user.role === 'admin' || user.role === 'teacher';

  const load = async () => {
    const res = await api.get('/announcements');
    setAnnouncements(res.data.data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/announcements', form);
    setForm({ title: '', message: '', audience: 'all' });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Announcements</h1>

      {canPost && (
        <form onSubmit={handleCreate} className="card space-y-3">
          <input required placeholder="Title" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required placeholder="Message" rows={3} className="input-field" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <select className="input-field max-w-xs" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">Everyone</option>
            <option value="students">Students only</option>
            <option value="teachers">Teachers only</option>
          </select>
          <button type="submit" className="btn-primary">
            Post Announcement
          </button>
        </form>
      )}

      <div className="space-y-3">
        {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
        {announcements.map((a) => (
          <div key={a._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{a.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {a.postedBy?.name} • {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              {(user.role === 'admin' || a.postedBy?._id === user.id) && (
                <button onClick={() => handleDelete(a._id)} className="text-red-600 text-xs font-medium hover:underline">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
