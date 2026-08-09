import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  const avatarUrl = user?.avatar ? `${apiBase}${user.avatar}` : null;

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
      <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
        </div>
        <button onClick={logout} className="btn-secondary text-sm">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
