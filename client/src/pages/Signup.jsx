import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

// Public signup for demo/portfolio purposes. In a real deployment, admins
// would typically create teacher/student accounts via the Admin panel instead.
const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    employeeId: '',
    department: '',
    course: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Course list is needed for the student picker; fetched from the public
  // /api/courses endpoint since the person isn't authenticated yet.
  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data.data))
      .catch(() => setCourses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.role === 'student' && !form.course) {
      setError('Please select a course');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        profile:
          form.role === 'student'
            ? { rollNumber: form.rollNumber, department: form.department, course: form.course }
            : { employeeId: form.employeeId, department: form.department },
      };
      const user = await signup(payload);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">Create account</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Join the College Management System</p>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="label">Full name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {form.role === 'student' ? (
            <>
              <div>
                <label className="label">Roll number</label>
                <input required className="input-field" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div>
                <label className="label">Course</label>
                <select required className="input-field" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                {courses.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No courses exist yet — ask an admin to create one from the Admin panel before signing up as a student.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="label">Employee ID</label>
              <input required className="input-field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">Department</label>
            <input required className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;