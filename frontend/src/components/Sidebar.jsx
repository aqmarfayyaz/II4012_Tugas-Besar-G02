import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, currentProject, selectProject, logout } = useAuth();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'folder', label: 'Projects', path: '/projects' },
    { icon: 'group', label: 'Candidates', path: '/candidates' },
    { icon: 'insights', label: 'Analytics', path: '/analytics' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

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

        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Recruitment Projects</span>
            <button
              onClick={() => navigate('/projects?new=1')}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Create project"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="space-y-1 max-h-[240px] overflow-y-auto pr-2">
            {projects.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No projects yet</div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    selectProject(project.id);
                    navigate(`/projects/${project.id}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentProject?.id === project.id
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate">{project.name}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{project.job_title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      <div className="pt-6 border-t border-slate-100 space-y-1">
        <button onClick={() => navigate('/landing')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors font-sans text-sm font-medium">
          <span className="material-symbols-outlined">help</span>
          Support
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors font-sans text-sm font-medium"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
