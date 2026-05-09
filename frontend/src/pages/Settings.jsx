import React, { useState } from 'react';
import Layout from '../components/Layout';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'TalentPulse Inc',
    email: 'admin@talentpulse.com',
    notifications: true,
    darkMode: false,
    apiKey: '••••••••••••••••',
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <Layout title="Settings">
      <div className="max-w-[800px] mx-auto px-8 py-8">
        <header className="mb-8">
          <h2 className="font-h2 text-h2 text-primary">Settings</h2>
          <p className="font-body-md text-body-md text-secondary mt-2">
            Manage your account preferences and system configuration
          </p>
        </header>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-h3 text-h3 text-primary mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase block mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg font-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg font-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-h3 text-h3 text-primary mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-slate-900">Email Notifications</p>
                  <p className="text-label-sm text-secondary mt-1">Receive email alerts for screening results</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-6 h-6 accent-primary cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  <p className="font-body-md text-slate-900">Dark Mode</p>
                  <p className="text-label-sm text-secondary mt-1">Enable dark theme</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                  className="w-6 h-6 accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-h3 text-h3 text-primary mb-6">API Configuration</h3>
            <div>
              <label className="font-label-sm text-label-sm text-secondary uppercase block mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={settings.apiKey}
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-body-md bg-slate-50"
                />
                <button className="px-6 py-2 border border-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="font-h3 text-h3 text-red-700 mb-4">Danger Zone</h3>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button className="px-6 py-2 border border-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
