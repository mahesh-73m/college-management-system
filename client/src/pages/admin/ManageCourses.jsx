import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', department: '', durationYears: 4 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', course: '', semester: 1 });
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [c, s, t] = await Promise.all([api.get('/admin/courses'), api.get('/admin/subjects'), api.get('/teachers')]);
    setCourses(c.data.data);
    setSubjects(s.data.data);
    setTeachers(t.data.data);
  };

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    await api.post('/admin/courses', courseForm);
    setCourseForm({ name: '', code: '', department: '', durationYears: 4 });
    loadAll();
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    await api.post('/admin/subjects', { ...subjectForm, semester: Number(subjectForm.semester) });
    setSubjectForm({ name: '', code: '', course: '', semester: 1 });
    loadAll();
  };

  const handleAssignTeacher = async (subjectId, teacherId) => {
    if (!teacherId) return;
    await api.put(`/admin/subjects/${subjectId}/assign`, { teacher: teacherId });
    loadAll();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Courses & Subjects</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Add Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <input required placeholder="Course name" className="input-field" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
            <input required placeholder="Course code (e.g. CSE)" className="input-field" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
            <input required placeholder="Department" className="input-field" value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} />
            <input type="number" min={1} placeholder="Duration (years)" className="input-field" value={courseForm.durationYears} onChange={(e) => setCourseForm({ ...courseForm, durationYears: e.target.value })} />
            <button type="submit" className="btn-primary w-full">
              Add Course
            </button>
          </form>
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-700 text-sm">
            {courses.map((c) => (
              <li key={c._id} className="py-2 flex justify-between">
                <span className="text-gray-800 dark:text-gray-200">{c.name}</span>
                <span className="text-gray-500">{c.code}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Add Subject</h2>
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <input required placeholder="Subject name" className="input-field" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
            <input required placeholder="Subject code" className="input-field" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} />
            <select required className="input-field" value={subjectForm.course} onChange={(e) => setSubjectForm({ ...subjectForm, course: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input type="number" min={1} max={12} placeholder="Semester" className="input-field" value={subjectForm.semester} onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })} />
            <button type="submit" className="btn-primary w-full">
              Add Subject
            </button>
          </form>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Subjects & Teacher Assignment</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Course</th>
              <th className="py-2 pr-4">Semester</th>
              <th className="py-2 pr-4">Assigned Teacher</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{s.name}</td>
                <td className="py-2 pr-4 text-gray-500">{s.course?.name}</td>
                <td className="py-2 pr-4 text-gray-500">{s.semester}</td>
                <td className="py-2 pr-4">
                  <select className="input-field !py-1" defaultValue={s.teacher?._id || ''} onChange={(e) => handleAssignTeacher(s._id, e.target.value)}>
                    <option value="">Unassigned</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.user?.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No subjects created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
