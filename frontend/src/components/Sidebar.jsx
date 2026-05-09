import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'cloud_upload', label: 'Upload', path: '/upload' },
    { icon: 'group', label: 'Candidates', path: '/candidates' },
    { icon: 'leaderboard', label: 'Ranking', path: '/ranking' },
    { icon: 'insights', label: 'Analytics', path: '/analytics' },
    { icon: 'person', label: 'Profile', path: '/profile' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-slate-200 bg-white p-6 space-y-2 flex flex-col z-50">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tighter text-slate-900">TalentPulse AI</h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Recruitment</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-sm font-medium tracking-tight transition-colors ${
              isActive(item.path)
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100 space-y-1">
        <button onClick={() => navigate('/landing')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors font-sans text-sm font-medium">
          <span className="material-symbols-outlined">help</span>
          Support
        </button>
        <button onClick={() => { localStorage.removeItem('auth_token'); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors font-sans text-sm font-medium">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
