import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, currentProject, selectProject, createProject, deleteProject } = useAuth();
  const [showNewProject, setShowNewProject] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
  });

  const handleCreateProject = () => {
    if (formData.name && formData.role && formData.department) {
      createProject(formData);
      setFormData({ name: '', role: '', department: '' });
      setShowNewProject(false);
      navigate('/upload');
    }
  };

  const handleSelectProject = (project) => {
    selectProject(project.id);
    navigate('/upload');
  };

  return (
    <Layout title="Projects">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Recruitment Projects</h1>
            <p className="text-body-md text-secondary mt-1">Manage multiple recruitment projects for different roles</p>
          </div>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Project
          </button>
        </div>

        {/* New Project Form */}
        {showNewProject && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-body-md font-semibold text-primary mb-4">Create New Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Project Name (e.g., Senior Engineer - Q2)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Role (e.g., Senior Developer)"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-body-md font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-label-sm text-slate-600 mt-1">{project.role}</p>
                  </div>
                  {currentProject?.id === project.id && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-label-sm font-bold rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-label-sm text-slate-600">
                    <span className="material-symbols-outlined text-sm">domain</span>
                    {project.department}
                  </div>
                  <div className="flex items-center gap-2 text-label-sm text-slate-600">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {project.createdAt}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectProject(project)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all text-center"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">folder_off</span>
            <p className="text-body-md text-slate-600">No projects yet. Create your first recruitment project!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
