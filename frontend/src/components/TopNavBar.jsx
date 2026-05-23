import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, getActivity } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LS_KEY = 'notifications_last_seen_at';

// ── debounce helper ───────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TopNavBar = ({ title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, projects, logout } = useAuth();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [candidateResults, setCandidateResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query.trim(), 300);

  // ── unread notifications count ─────────────────────────────────────────
  useEffect(() => {
    getActivity({ limit: 20 }).then(resp => {
      const events = resp.data?.data?.events || resp.data?.events || [];
      const lastSeen = new Date(localStorage.getItem(LS_KEY) || 0);
      setUnreadCount(events.filter(ev => {
        try { return new Date(ev.created_at + 'Z') > lastSeen; } catch { return false; }
      }).length);
    }).catch(() => {});
  }, []);

  // ── search candidates via API ──────────────────────────────────────────
  const runSearch = useCallback(async (q) => {
    if (!q) { setCandidateResults([]); return; }
    setSearching(true);
    try {
      const resp = await getCandidates({ search: q, page_size: 5 });
      const payload = resp.data?.data || resp.data;
      setCandidateResults(payload?.candidates || []);
    } catch {
      setCandidateResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
    setOpen(!!debouncedQuery);
  }, [debouncedQuery, runSearch]);

  // ── project results (client-side filter) ─────────────────────────────
  const projectResults = debouncedQuery
    ? projects.filter(p =>
        p.name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.job_title?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults = projectResults.length > 0 || candidateResults.length > 0;

  // ── close on outside click ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── keyboard: Escape closes ────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const go = (path) => {
    setQuery('');
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 right-0 left-[280px] h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md flex justify-between items-center px-8 z-40">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="font-h2 text-h2 text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* ── Global Search ── */}
        <div className="relative w-64 hidden md:block" ref={containerRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
          {searching && (
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base animate-spin">progress_activity</span>
          )}
          {query && !searching && (
            <button
              onClick={() => { setQuery(''); setCandidateResults([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => debouncedQuery && setOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Search candidates, projects…"
            type="text"
            autoComplete="off"
          />

          {/* ── Dropdown ── */}
          {open && (
            <div className="absolute top-full mt-2 left-0 w-[360px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {!hasResults && !searching && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No results for "{debouncedQuery}"
                </div>
              )}

              {projectResults.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Projects</p>
                  {projectResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => go(`/projects/${p.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">folder</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.job_title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {candidateResults.length > 0 && (
                <div className={projectResults.length > 0 ? 'border-t border-slate-100' : ''}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Candidates</p>
                  {candidateResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => go(`/candidate/${c.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">person</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.applied_position || c.email}</p>
                      </div>
                      {c.match_score > 0 && (
                        <span className={`text-xs font-semibold flex-shrink-0 ${c.match_score >= 80 ? 'text-green-600' : c.match_score >= 60 ? 'text-blue-600' : 'text-slate-400'}`}>
                          {c.match_score.toFixed(0)}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {hasResults && (
                <div className="border-t border-slate-100 px-4 py-2">
                  <button
                    onClick={() => go(`/candidates?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    See all candidate results →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => navigate('/notifications')} className="text-slate-500 hover:text-slate-900 transition-colors relative p-2" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-error text-white text-[9px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-slate-900 transition-colors p-2" aria-label="History">
          <span className="material-symbols-outlined">history</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all"
            title="Account settings"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                {(user?.name || user?.email || user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </button>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
