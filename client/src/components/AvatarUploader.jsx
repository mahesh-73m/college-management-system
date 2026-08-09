import React, { useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

// Click-to-upload profile picture. Shows the current avatar (or initial)
// and lets the user pick a new image or remove the existing one.
const AvatarUploader = ({ size = 'w-16 h-16', textSize = 'text-2xl' }) => {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  const avatarUrl = user?.avatar ? `${apiBase}${user.avatar}` : null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      refreshUser({ avatar: res.data.data.avatar });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await api.delete('/users/me/avatar');
      refreshUser({ avatar: '' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={`${size} rounded-full bg-primary-500 text-white flex items-center justify-center ${textSize} font-semibold overflow-hidden relative group shrink-0`}
        title="Click to change profile picture"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
        ) : (
          user?.name?.charAt(0).toUpperCase()
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">
          {uploading ? '...' : 'Edit'}
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      <div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
        <div className="flex gap-3 text-xs mt-1">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-primary-600 font-medium hover:underline">
            Change photo
          </button>
          {avatarUrl && (
            <button type="button" onClick={handleRemove} className="text-red-600 font-medium hover:underline">
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default AvatarUploader;
