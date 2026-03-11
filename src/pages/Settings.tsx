import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      if (auth && user) {
        await updateProfile(user, { displayName });
        setMessage('Profile updated successfully.');
      } else {
        // Mock update
        const mockUser = JSON.parse(localStorage.getItem('mock_user') || '{}');
        localStorage.setItem('mock_user', JSON.stringify({ ...mockUser, displayName }));
        window.dispatchEvent(new Event('storage'));
        setMessage('Profile updated successfully (Mock).');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('mock_user');
      window.dispatchEvent(new Event('storage'));
    }
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Settings</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-100 p-4">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-medium text-sm transition-colors">
                <User size={18} />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium text-sm transition-colors">
                <Bell size={18} />
                Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium text-sm transition-colors">
                <Shield size={18} />
                Security
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Profile Information</h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-md">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                  {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <button type="button" className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 text-sm cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-neutral-500">Email cannot be changed here.</p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
