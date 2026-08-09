import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">Welcome back</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to the College Management System</p>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@cms.edu"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-6 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="font-medium mb-1">Demo logins (after running the seed script):</p>
          <p>Admin: admin@cms.edu / Admin@123</p>
          <p>Teacher: teacher@cms.edu / Teacher@123</p>
          <p>Student: student@cms.edu / Student@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
