import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getActivity } from '../services/api';

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const EVENT_META = {
  cv_upload:          { icon: 'upload_file',     color: 'text-blue-600',  bg: 'bg-blue-50',   label: 'CV Upload'      },
  screening_complete: { icon: 'smart_toy',        color: 'text-green-600', bg: 'bg-green-50',  label: 'AI Screening'   },
  project_created:    { icon: 'create_new_folder',color: 'text-purple-600',bg: 'bg-purple-50', label: 'New Project'    },
  project_updated:    { icon: 'edit',             color: 'text-amber-600', bg: 'bg-amber-50',  label: 'Project Update' },
};

const getMeta = (type) =>
  EVENT_META[type] || { icon: 'history', color: 'text-slate-500', bg: 'bg-slate-100', label: 'Activity' };

function formatRelative(isoString) {
  try {
    const date = new Date(isoString + 'Z');
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

function groupByDate(events) {
  const groups = {};
  const now = new Date();

  events.forEach(ev => {
    let label;
    try {
      const d = new Date(ev.created_at + 'Z');
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays === 0)      label = 'Today';
      else if (diffDays === 1) label = 'Yesterday';
      else if (diffDays < 7)  label = 'This Week';
      else if (diffDays < 30) label = 'This Month';
      else                    label = 'Earlier';
    } catch { label = 'Earlier'; }
    if (!groups[label]) groups[label] = [];
    groups[label].push(ev);
  });

  const ORDER = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
  return ORDER.filter(k => groups[k]).map(k => ({ label: k, events: groups[k] }));
}

const History = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await getActivity({ limit: 100 });
      const payload = resp.data?.data || resp.data;
      setEvents(payload?.events || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = groupByDate(events);

  if (loading) {
    return (
      <Layout title="History">
        <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
          <div className="space-y-2"><Pulse className="h-8 w-24" /><Pulse className="h-4 w-56" /></div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Pulse className="h-4 w-48" />
                  <Pulse className="h-3 w-64" />
                </div>
                <Pulse className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="History">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1 font-h1 text-primary">History</h1>
            <p className="text-body-md text-secondary mt-1">
              A log of all actions performed in your workspace
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          )}
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
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">history</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No activity yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              Your screening runs, CV uploads, and project actions will appear here once you start using the app.
            </p>
          </div>
        )}

        {groups.map(({ label, events: groupEvents }) => (
          <div key={label}>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">{label}</p>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {groupEvents.map(ev => {
                const meta = getMeta(ev.event_type);
                return (
                  <div key={ev.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <span className={`material-symbols-outlined text-base ${meta.color}`}>{meta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                      {ev.detail && <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.detail}</p>}
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-400 whitespace-nowrap">{formatRelative(ev.created_at)}</span>
                      {ev.link && (
                        <button
                          onClick={() => navigate(ev.link)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default History;
