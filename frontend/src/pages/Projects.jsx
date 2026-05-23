import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projects,
    projectsLoading,
    currentProject,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
  } = useAuth();
  const [showNewProject, setShowNewProject] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    department: '',
    job_description: '',
    required_skills: '',
    employment_type: 'full-time',
    start_date: '',
    end_date: '',
    hiring_quota: '',
    hiring_manager: '',
    priority: 'medium',
    notes: '',
    status: 'draft',
  });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setShowNewProject(true);
    }
  }, [location.search]);

  const resetForm = () => {
    setFormData({
      name: '',
      job_title: '',
      department: '',
      job_description: '',
      required_skills: '',
      employment_type: 'full-time',
      start_date: '',
      end_date: '',
      hiring_quota: '',
      hiring_manager: '',
      priority: 'medium',
      notes: '',
      status: 'draft',
    });
    setEditingProjectId(null);
    setError('');
  };

  const handleCreateProject = async () => {
    setError('');
    if (
      !formData.name ||
      !formData.job_title ||
      !formData.department ||
      !formData.job_description ||
      !formData.required_skills ||
      !formData.start_date ||
      !formData.end_date
    ) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        required_skills: formData.required_skills.split(',').map((item) => item.trim()).filter(Boolean),
        hiring_quota: formData.hiring_quota ? Number(formData.hiring_quota) : undefined,
      };

      if (editingProjectId) {
        const updated = await updateProject(editingProjectId, payload);
        selectProject(updated.id);
        navigate(`/projects/${updated.id}`);
      } else {
        const created = await createProject(payload);
        selectProject(created.id);
        navigate(`/projects/${created.id}`);
      }

      resetForm();
      setShowNewProject(false);
      fetchProjects();
    } catch (err) {
      setError(err?.message || 'Unable to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectProject = (project) => {
    selectProject(project.id);
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setShowNewProject(true);
    setFormData({
      name: project.name || '',
      job_title: project.job_title || '',
      department: project.department || '',
      job_description: project.job_description || '',
      required_skills: (project.required_skills || []).join(', '),
      employment_type: project.employment_type || 'full-time',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      hiring_quota: project.hiring_quota || '',
      hiring_manager: project.hiring_manager || '',
      priority: project.priority || 'medium',
      notes: project.notes || '',
      status: project.status || 'draft',
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <Layout title="Projects">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Recruitment Projects</h1>
            <p className="text-body-md text-secondary mt-1">Create and manage recruitment projects that power your AI CV screening pipeline</p>
          </div>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Project
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-secondary text-xl">search</span>
            <input
              type="text"
              placeholder="Search by project or job title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-label-sm text-secondary font-semibold">Status:</span>
            {['all', 'draft', 'active', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showNewProject && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-body-md font-semibold text-primary mb-4">
              {editingProjectId ? 'Edit Project' : 'Create New Project'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Project Name (e.g., Data Analyst Hiring Q3)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Job Title/Position"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Department / Division"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <input
                type="text"
                placeholder="Required skills (comma-separated)"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Hiring manager / recruiter PIC"
                value={formData.hiring_manager}
                onChange={(e) => setFormData({ ...formData, hiring_manager: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="number"
                placeholder="Hiring quota"
                value={formData.hiring_quota}
                onChange={(e) => setFormData({ ...formData, hiring_quota: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <textarea
                placeholder="Job description"
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                className="min-h-[140px] px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <textarea
                placeholder="Optional notes / hiring criteria"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[140px] px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            {error && (
              <div className="p-3 mb-4 bg-error-container text-on-error-container text-xs rounded-lg">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
              </button>
              <button
                onClick={() => {
                  setShowNewProject(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {projectsLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
            Loading projects...
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-body-md font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-label-sm text-slate-600 mt-1">{project.job_title}</p>
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
                    {project.start_date} → {project.end_date}
                  </div>
                  <div className="flex items-center gap-2 text-label-sm text-slate-600">
                    <span className="material-symbols-outlined text-sm">flag</span>
                    {(project.priority || 'medium').toUpperCase()} priority · {(project.status || 'draft').toUpperCase()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectProject(project)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all text-center"
                  >
                    Open Project
                  </button>
                  <button
                    onClick={() => handleEditProject(project)}
                    className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
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
            <p className="text-body-md text-slate-600">No projects found. Create your first recruitment project!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
