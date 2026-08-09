import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-validate the token on app load so a stale/expired token doesn't
    // leave the UI thinking the user is still logged in.
    const token = localStorage.getItem('cms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cms_token', res.data.token);
    localStorage.setItem('cms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    localStorage.setItem('cms_token', res.data.token);
    localStorage.setItem('cms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
  };

  // Merge a partial update (e.g. a new avatar path) into the current user
  // and persist it, without a full re-fetch from the server.
  const refreshUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('cms_user', JSON.stringify(next));
      return next;
    });
  };

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cms_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cms_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
