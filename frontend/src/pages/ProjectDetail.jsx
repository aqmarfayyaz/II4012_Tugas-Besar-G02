import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectProject } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProject(id);
        const payload = response.data?.data || response.data;
        const detail = payload.project || payload.data?.project;
        setProject(detail);
        if (detail?.id) {
          selectProject(detail.id);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load project.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, selectProject]);

  if (loading) {
    return (
      <Layout title="Project">
        <div className="max-w-[1440px] mx-auto px-8 py-8 text-slate-500">Loading project...</div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout title="Project">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">
            {error || 'Project not found.'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Project">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">{project.name}</h1>
            <p className="text-body-md text-secondary mt-1">{project.job_title} · {project.department}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Upload CV
            </button>
            <button
              onClick={() => navigate('/candidates')}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Candidates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Candidates', value: 0 },
            { label: 'Candidates Screened', value: 0 },
            { label: 'Top Candidates', value: 0 },
            { label: 'Avg Match Score', value: '0%' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">{item.label}</p>
              <h3 className="text-h2 font-h2 text-primary">{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
            <h3 className="text-body-md font-semibold text-primary mb-4">Recruitment Overview</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div><span className="font-semibold text-slate-700">Status:</span> {project.status?.toUpperCase()}</div>
              <div><span className="font-semibold text-slate-700">Employment:</span> {project.employment_type}</div>
              <div><span className="font-semibold text-slate-700">Timeline:</span> {project.start_date} → {project.end_date}</div>
              <div><span className="font-semibold text-slate-700">Hiring quota:</span> {project.hiring_quota || 'Not set'}</div>
              <div><span className="font-semibold text-slate-700">Hiring manager:</span> {project.hiring_manager || 'Not assigned'}</div>
              <div><span className="font-semibold text-slate-700">Priority:</span> {project.priority?.toUpperCase()}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">CV Screening Pipeline</h3>
            <ol className="space-y-3 text-sm text-slate-600">
              <li>1. Upload CV (PDF/DOCX)</li>
              <li>2. Parsing & Extraction</li>
              <li>3. Data Normalization</li>
              <li>4. Embedding & Similarity</li>
              <li>5. Candidate Ranking</li>
              <li>6. AI Recommendation</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">Job Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{project.job_description}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">Required Skills</h3>
            {project.required_skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {project.required_skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills defined yet.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">person_search</span>
          <p className="text-sm text-slate-600">No candidates have been uploaded yet. Start by uploading CVs to begin screening.</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
          >
            Upload CVs
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
