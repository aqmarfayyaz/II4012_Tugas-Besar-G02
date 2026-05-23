import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { fetchMyProfile, saveMyProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Resize an image file to a square data-URL (max side = size px) ────────
const resizeImage = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(size / img.width, size / img.height, 1);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

// ── Toggle switch component ───────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      ${checked ? 'bg-primary' : 'bg-slate-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

// ── Toast notification ────────────────────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
        transition-all animate-pulse
        ${isError
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-green-50 border border-green-200 text-green-700'}`}
    >
      <span className="material-symbols-outlined text-lg">
        {isError ? 'error' : 'check_circle'}
      </span>
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────
const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// ── Main component ────────────────────────────────────────────────────────
const Settings = () => {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);          // last saved
  const [form, setForm] = useState({                     // current editable
    name: '',
    company_name: '',
    notifications_enabled: true,
    avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const toastTimer = useRef(null);
  const avatarInputRef = useRef(null);

  // ── Show toast ────────────────────────────────────────────────────────
  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load profile on mount ─────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchMyProfile();
      const payload = resp.data?.data || resp.data;
      const p = payload?.profile || payload;
      const loaded = {
        name: p?.name || '',
        company_name: p?.company_name || '',
        notifications_enabled: p?.notifications_enabled !== false, // default true
        avatar: p?.avatar || '',
      };
      setProfile(loaded);
      setForm(loaded);
    } catch {
      showToast('error', 'Could not load profile. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Track dirty state ─────────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const changed =
      form.name !== profile.name ||
      form.company_name !== profile.company_name ||
      form.notifications_enabled !== profile.notifications_enabled ||
      form.avatar !== profile.avatar;
    setIsDirty(changed);
  }, [form, profile]);

  // ── Avatar upload ─────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file.');
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 256);
      setForm(f => ({ ...f, avatar: dataUrl }));
    } catch {
      showToast('error', 'Could not process the image. Try another file.');
    }
    // reset input so the same file can be re-selected
    e.target.value = '';
  };


  // ── Field change ──────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isDirty) return;
    // Basic validation
    if (form.name && form.name.trim().length < 2) {
      showToast('error', 'Display name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      const resp = await saveMyProfile({
        name: form.name.trim(),
        company_name: form.company_name.trim(),
        notifications_enabled: form.notifications_enabled,
        avatar: form.avatar,
      });
      const payload = resp.data?.data || resp.data;
      const saved = payload?.profile || payload;
      const newProfile = {
        name: saved?.name || form.name,
        company_name: saved?.company_name || form.company_name,
        notifications_enabled: saved?.notifications_enabled !== false,
        avatar: saved?.avatar ?? form.avatar,
      };
      setProfile(newProfile);
      setForm(newProfile);
      setIsDirty(false);
      showToast('success', 'Settings saved successfully.');
      refreshProfile();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel / reset ────────────────────────────────────────────────────
  const handleCancel = () => {
    if (!profile) return;
    setForm(profile);
    setIsDirty(false);
  };

  // ── Email from localStorage / AuthContext (read-only display) ─────────
  // The email is stored in the token subject, not editable here
  const storedEmail = (() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return '';
      // JWT payload is the second segment, base64-encoded
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub || '';
    } catch { return ''; }
  })();

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout title="Settings">
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
          <div className="space-y-2"><Pulse className="h-8 w-32" /><Pulse className="h-4 w-64" /></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <Pulse className="h-5 w-40 mb-2" />
              <Pulse className="h-10 w-full" />
              <Pulse className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      {/* Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Settings</h1>
            <p className="text-body-md text-secondary mt-1">
              Manage your account preferences and system configuration
            </p>
          </div>
          {isDirty && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">edit</span>
                Unsaved changes
              </span>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* ── Account Settings ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-body-md font-semibold text-primary mb-6">Account Settings</h3>

          {/* Profile Picture */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
            <div className="relative flex-shrink-0">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold select-none">
                  {(form.name || storedEmail || '?')[0].toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
                title="Change photo"
              >
                <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 15 }}>photo_camera</span>
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Profile Photo</p>
              <p className="text-xs text-slate-500 mb-3">JPG, PNG or GIF · Max 5 MB · Resized to 256 × 256</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload Photo
                </button>
                {form.avatar && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, avatar: '' }))}
                    className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="text-label-sm text-secondary uppercase tracking-wider font-semibold block mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-label-sm text-secondary uppercase tracking-wider font-semibold block mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={storedEmail}
                  readOnly
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base">lock</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="text-label-sm text-secondary uppercase tracking-wider font-semibold block mb-2">
                Company / Organisation Name
              </label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                placeholder="e.g. TalentPulse Inc"
                className="w-full md:w-1/2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Preferences ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-body-md font-semibold text-primary mb-6">Preferences</h3>
          <div className="space-y-0">

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive email alerts for AI screening results and candidate updates
                </p>
              </div>
              <Toggle
                checked={form.notifications_enabled}
                onChange={v => handleChange('notifications_enabled', v)}
              />
            </div>

          </div>
        </div>

        {/* ── Danger Zone ───────────────────────────────────────────────── */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h3 className="text-body-md font-semibold text-red-700 mb-2">Danger Zone</h3>
          <p className="text-xs text-red-500 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <button
            onClick={() => showToast('error', 'Account deletion is disabled in this environment.')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* ── Save footer (always visible if dirty) ─────────────────────── */}
        <div className={`flex justify-end gap-3 pt-4 border-t border-slate-100 transition-opacity ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <span className="material-symbols-outlined text-sm">progress_activity</span>}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;
