import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProject, getProjectCandidates, getScreeningResults } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const statusBadge = (status) => {
  const map = {
    shortlisted: 'bg-green-100 text-green-700',
    review: 'bg-blue-100 text-blue-700',
    applied: 'bg-slate-100 text-slate-600',
    interviewed: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const scoreColor = (score) => {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-blue-700';
  if (score >= 40) return 'text-yellow-600';
  return 'text-slate-400';
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectProject } = useAuth();

  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateTotal, setCandidateTotal] = useState(0);
  const [screeningResults, setScreeningResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch project, candidates, and screening results in parallel so loading
      // only clears when all three are ready — prevents empty-state flash.
      const [projResp, candResp, screenResp] = await Promise.all([
        getProject(id),
        getProjectCandidates(id),
        getScreeningResults(id),
      ]);

      // Project
      const payload = projResp.data?.data || projResp.data;
      const detail = payload?.project || payload?.data?.project;
      setProject(detail || null);
      if (detail?.id) selectProject(detail.id);

      // Candidates
      const candData = candResp.data?.data || candResp.data;
      const candList = candData?.candidates || [];
      setCandidates(candList);
      setCandidateTotal(candData?.total ?? candList.length);

      // Screening results (sorted newest first by the backend)
      const screenData = screenResp.data?.data || screenResp.data;
      setScreeningResults(screenData?.results || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load project.');
    } finally {
      setLoading(false);
    }
  }, [id, selectProject]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── KPI derivations ──────────────────────────────────────────────────────
  const screened = candidates.filter(c => (c.match_score || 0) > 0).length;
  const shortlisted = candidates.filter(c => (c.match_score || 0) >= 80).length;
  const avgScore = screened > 0
    ? Math.round(
        candidates
          .filter(c => (c.match_score || 0) > 0)
          .reduce((sum, c) => sum + (c.match_score || 0), 0) / screened
      )
    : 0;

  const latestScreening = screeningResults[0] || null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout title="Project">
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Pulse className="h-8 w-64" />
              <Pulse className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <Pulse className="h-3 w-24 mb-3" />
                <Pulse className="h-8 w-20" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
              <Pulse className="h-4 w-40 mb-4" />
              {[...Array(5)].map((_, i) => <Pulse key={i} className="h-3 w-full mb-2" />)}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <Pulse className="h-4 w-40 mb-4" />
              {[...Array(4)].map((_, i) => <Pulse key={i} className="h-3 w-3/4 mb-2" />)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <Pulse className="h-4 w-32 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50">
                <Pulse className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Pulse className="h-3 w-32" />
                  <Pulse className="h-2.5 w-24" />
                </div>
                <Pulse className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
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

        {/* Header */}
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

        {/* KPI cards — populated from real candidate + screening data */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Candidates', value: candidateTotal },
            { label: 'Candidates Screened', value: screened },
            { label: 'Top Candidates', value: shortlisted },
            { label: 'Avg Match Score', value: avgScore > 0 ? `${avgScore}%` : '—' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">{item.label}</p>
              <h3 className="text-h2 font-h2 text-primary">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* Project overview + pipeline */}
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

        {/* Job description + required skills */}
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

        {/* Candidates section — empty state only when truly zero candidates */}
        {candidateTotal === 0 ? (
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
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-body-md font-semibold text-primary">Candidates</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {candidateTotal} candidate{candidateTotal !== 1 ? 's' : ''} in this project
                </p>
              </div>
              <div className="flex gap-2">
                {latestScreening && (
                  <button
                    onClick={() => navigate('/ranking')}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">leaderboard</span>
                    View Rankings
                  </button>
                )}
                <button
                  onClick={() => navigate('/upload')}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs">upload_file</span>
                  Upload More
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {candidates.slice(0, 8).map((c) => {
                const cid = c.candidate_id || c.id;
                const score = c.match_score || 0;
                return (
                  <div
                    key={cid}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/candidate/${cid}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{c.email || '—'}</p>
                    </div>
                    <div className="hidden sm:block text-xs text-slate-500 w-32 truncate">
                      {c.applied_position || c.department || '—'}
                    </div>
                    <div className="w-20 text-right">
                      {score > 0 ? (
                        <span className={`text-sm font-bold ${scoreColor(score)}`}>
                          {Math.round(score)}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not screened</span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge(c.status)}`}>
                      {c.status || 'applied'}
                    </span>
                  </div>
                );
              })}
            </div>

            {candidateTotal > 8 && (
              <div className="px-6 py-3 text-center border-t border-slate-50">
                <button
                  onClick={() => navigate('/candidates')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  View all {candidateTotal} candidates →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Latest screening result — only shown when a result exists */}
        {latestScreening && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-md font-semibold text-primary">Latest Screening Result</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {latestScreening.created_at
                    ? new Date(latestScreening.created_at).toLocaleDateString()
                    : ''}
                </span>
                <button
                  onClick={() => navigate('/ranking')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Full rankings →
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-600">
              <span>
                <span className="font-semibold text-slate-800">
                  {latestScreening.total_candidates ?? latestScreening.ranked_candidates?.length ?? 0}
                </span>{' '}
                candidates ranked
              </span>
              {latestScreening.job_category && (
                <span>
                  Category:{' '}
                  <span className="font-semibold text-slate-800">{latestScreening.job_category}</span>
                </span>
              )}
            </div>
            <div className="space-y-2">
              {(latestScreening.ranked_candidates || []).slice(0, 5).map((rc, idx) => {
                const rcScore = rc.overall_score ?? 0;
                return (
                  <div key={rc.candidate_id || idx} className="flex items-center gap-3 text-sm py-1">
                    <span className="w-6 text-xs font-bold text-slate-400 flex-shrink-0">
                      #{rc.rank || idx + 1}
                    </span>
                    <span className="flex-1 font-semibold text-slate-700 truncate">
                      {rc.name || rc.candidate_name || 'Unknown'}
                    </span>
                    <span className={`font-bold ${scoreColor(rcScore)}`}>
                      {Math.round(rcScore)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ProjectDetail;
