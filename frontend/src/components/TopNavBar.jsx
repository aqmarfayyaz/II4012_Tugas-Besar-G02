import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

const TopNavBar = ({ title = 'Dashboard' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      if (token) await logoutUser(token);
    } catch (e) {
      // ignore errors
    }
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-[280px] h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md flex justify-between items-center px-8 z-40">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="font-h2 text-h2 text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Search..."
            type="text"
          />
        </div>

        <button onClick={() => navigate('/notifications')} className="text-slate-500 hover:text-slate-900 transition-colors relative p-2" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error"></span>
        </button>
        <button onClick={() => navigate('/history')} className="text-slate-500 hover:text-slate-900 transition-colors p-2" aria-label="History">
          <span className="material-symbols-outlined">history</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-shadow">A</div>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
