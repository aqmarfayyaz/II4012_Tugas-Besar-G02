import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getActivity } from '../services/api';

const LS_KEY = 'notifications_last_seen_at';

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const EVENT_META = {
  cv_upload:          { icon: 'upload_file',      color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-400'   },
  screening_complete: { icon: 'smart_toy',         color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-400'  },
  project_created:    { icon: 'create_new_folder', color: 'text-purple-600',bg: 'bg-purple-50', border: 'border-purple-400' },
  project_updated:    { icon: 'edit',              color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-400'  },
};

const getMeta = (type) =>
  EVENT_META[type] || { icon: 'notifications', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-300' };

function formatTime(isoString) {
  try {
    const d = new Date(isoString + 'Z');
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

const Notifications = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSeen, setLastSeen] = useState(() => {
    const v = localStorage.getItem(LS_KEY);
    return v ? new Date(v) : new Date(0);
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await getActivity({ limit: 50 });
      const payload = resp.data?.data || resp.data;
      setEvents(payload?.events || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isUnread = (ev) => {
    try { return new Date(ev.created_at + 'Z') > lastSeen; }
    catch { return false; }
  };

  const unreadCount = events.filter(isUnread).length;

  const markAllRead = () => {
    const now = new Date();
    localStorage.setItem(LS_KEY, now.toISOString());
    setLastSeen(now);
  };

  if (loading) {
    return (
      <Layout title="Notifications">
        <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
          <div className="space-y-2"><Pulse className="h-8 w-36" /><Pulse className="h-4 w-52" /></div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-start border-l-4 border-slate-200 pl-4 py-2">
                <Pulse className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-48" />
                  <Pulse className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notifications">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-semibold bg-error text-white rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-body-md text-secondary mt-1">
              Stay up to date with AI screening results and workspace activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm font-semibold text-primary hover:underline px-3 py-2"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm text-red-700">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={load} className="ml-auto font-semibold underline">Retry</button>
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">notifications_none</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              Notifications will appear here when you upload CVs, run AI screenings, or update projects.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {events.map(ev => {
              const meta = getMeta(ev.event_type);
              const unread = isUnread(ev);
              return (
                <div
                  key={ev.id}
                  className={`flex items-start gap-4 p-4 border-l-4 transition-colors hover:bg-slate-50
                    ${unread ? meta.border : 'border-transparent'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                    <span className={`material-symbols-outlined text-base ${meta.color}`}>{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${unread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {ev.title}
                      </p>
                      {unread && (
                        <span className="w-2 h-2 bg-error rounded-full flex-shrink-0" />
                      )}
                    </div>
                    {ev.detail && <p className="text-xs text-slate-500 mt-0.5">{ev.detail}</p>}
                    <p className="text-xs text-slate-400 mt-1">{formatTime(ev.created_at)}</p>
                  </div>
                  {ev.link && (
                    <button
                      onClick={() => navigate(ev.link)}
                      className="flex-shrink-0 text-xs font-semibold text-primary hover:underline px-2 py-1"
                    >
                      View →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Notifications;
