import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';
import Layout from '../components/Layout';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await getProfile(token);
        setProfile(res.data.profile || {});
      } catch (e) {
        setError('Unable to load profile');
      }
    };
    load();
  }, [token]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(token, profile);
      setProfile(res.data.profile);
      setEditing(false);
    } catch (e) {
      setError('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Profile">
      <div className="max-w-2xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Your Profile</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.fullname || ''}
                onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
