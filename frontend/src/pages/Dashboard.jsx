import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../services/api';

const CAT_COLORS = [
  'bg-slate-900', 'bg-slate-600', 'bg-slate-400', 'bg-blue-400',
  'bg-indigo-400', 'bg-purple-400',
];

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const SkeletonKpiCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <Pulse className="h-3 w-24 mb-3" />
    <Pulse className="h-8 w-20" />
  </div>
);

const relativeTime = (isoStr) => {
  if (!isoStr) return '—';
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '—';
  }
};

const statusClass = {
  'HIGH MATCH': 'bg-green-100 text-green-700',
  'MED MATCH': 'bg-yellow-100 text-yellow-700',
  'LOW MATCH': 'bg-red-100 text-red-700',
  PENDING: 'bg-slate-100 text-slate-500',
};

const insightColor = { match: 'text-green-600', trend: 'text-blue-600', alert: 'text-yellow-600', info: 'text-slate-500' };

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || '?').slice(0, 2).toUpperCase();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentProject } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getDashboardMetrics(currentProject?.id || '');
      const payload = resp.data?.data || resp.data;
      setMetrics(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const m = metrics || {};
  const jobCategories   = m.job_categories    || [];
  const scoreDist       = m.score_distribution || [];
  const mq              = m.match_quality      || { analyzed: 0, high_match: 0, medium_match: 0, low_match: 0 };
  const submissions     = m.latest_submissions  || [];
  const aiInsights      = m.ai_insights         || [];
  const engine          = m.system_engine       || { queue_status: '—', processing_load: 0 };

  const maxCatCount   = Math.max(...jobCategories.map(c => c.count), 1);
  const maxScoreCount = Math.max(...scoreDist.map(d => d.count), 1);
  const circ          = 2 * Math.PI * 45;
  const highStroke    = (mq.high_match / 100) * circ;

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <span className="material-symbols-outlined text-red-500 text-2xl mt-0.5">error</span>
            <div>
              <p className="font-semibold text-red-700">Failed to load dashboard</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchMetrics}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Dashboard Overview</h1>
            <p className="text-body-md text-secondary mt-1">
              {currentProject
                ? `Metrics for: ${currentProject.name}`
                : 'Real-time recruitment performance metrics'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Refresh
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonKpiCard key={i} />)
          ) : (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Total Applicants</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-h2 font-h2 text-primary">{(m.total_applicants ?? 0).toLocaleString()}</h3>
                  <span className="text-label-sm text-slate-400 font-medium">total</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Candidates Screened</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-h2 font-h2 text-primary">{(m.candidates_screened ?? 0).toLocaleString()}</h3>
                  <span className="text-label-sm text-slate-400 font-medium">screened</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Shortlisted</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-h2 font-h2 text-primary">{(m.shortlisted ?? 0).toLocaleString()}</h3>
                  <span className="text-label-sm text-slate-400 font-medium">≥80%</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Avg Match Score</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-h2 font-h2 text-primary">
                    {m.candidates_screened > 0 ? `${m.avg_match_score}%` : '—'}
                  </h3>
                  <span className="text-label-sm text-slate-400 font-medium">avg</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Active Projects</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-h2 font-h2 text-primary">{(m.active_projects ?? 0).toLocaleString()}</h3>
                  <span className="text-label-sm text-slate-400 font-medium">of {m.projects_count ?? 0}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Candidates by Job Category</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Pulse className="h-3 w-32 mb-2" />
                    <Pulse className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : jobCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">bar_chart</span>
                <p className="text-sm">No category data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobCategories.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-700 font-medium">{cat.category}</span>
                      <span className="text-sm font-semibold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${CAT_COLORS[idx % CAT_COLORS.length]} rounded-full`}
                        style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Score Distribution</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">bar_chart</span>
              </button>
            </div>
            {loading ? (
              <div className="flex items-end justify-center gap-3 h-48">
                {[100, 150, 80].map((h, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2">
                    <Pulse className="w-full rounded-t-lg" style={{ height: h }} />
                    <Pulse className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : scoreDist.every(d => d.count === 0) ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">equalizer</span>
                <p className="text-sm">No screening data yet</p>
              </div>
            ) : (
              <div className="flex items-end justify-center gap-3 h-48">
                {scoreDist.map((dist, idx) => {
                  const colors = ['bg-slate-300', 'bg-slate-700', 'bg-slate-900'];
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full ${colors[idx]} rounded-t-lg`}
                        style={{ height: `${Math.max((dist.count / maxScoreCount) * 150, dist.count > 0 ? 4 : 0)}px` }}
                      />
                      <span className="text-[10px] text-slate-600 font-medium mt-2 text-center">{dist.range}</span>
                      <span className="text-xs font-semibold text-slate-800">{dist.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Match Quality</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">pie_chart</span>
              </button>
            </div>
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Pulse className="w-32 h-32 rounded-full" />
                <Pulse className="h-4 w-20" />
                <Pulse className="h-3 w-32" />
                <Pulse className="h-3 w-32" />
                <Pulse className="h-3 w-32" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-32 h-32 mb-4" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke="#091426"
                    strokeWidth="8"
                    strokeDasharray={`${highStroke} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <p className="text-h3 font-h3 text-slate-900">{mq.analyzed.toLocaleString()}</p>
                <p className="text-label-sm text-slate-600">ANALYZED</p>
                {mq.analyzed === 0 ? (
                  <p className="text-sm text-slate-400 mt-3 text-center">Run AI Screening to see match quality</p>
                ) : (
                  <div className="mt-4 space-y-2 w-full">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                        High Match
                      </span>
                      <span className="font-semibold">{mq.high_match}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        Medium Match
                      </span>
                      <span className="font-semibold">{mq.medium_match}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        Low Match
                      </span>
                      <span className="font-semibold">{mq.low_match}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Latest CV Submissions</h3>
              <button
                onClick={() => navigate('/candidates')}
                className="text-primary text-sm font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Pulse className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Pulse className="h-3 w-32" />
                      <Pulse className="h-3 w-24" />
                    </div>
                    <Pulse className="h-6 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3">upload_file</span>
                <p className="font-medium">No CVs uploaded yet</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-3 text-sm text-primary font-semibold hover:underline"
                >
                  Upload your first CV →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Candidate Name</th>
                      <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Job Position</th>
                      <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Upload Time</th>
                      <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Match Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                              {initials(sub.name)}
                            </div>
                            <span className="text-slate-900 font-medium">{sub.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{sub.position}</td>
                        <td className="px-4 py-3 text-slate-600">{relativeTime(sub.uploaded_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass[sub.match_status] || 'bg-slate-100 text-slate-600'}`}>
                            {sub.match_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">

            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 text-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-body-md font-semibold">System Engine</h3>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-white text-label-sm font-semibold rounded">
                    ● ACTIVE
                  </span>
                </div>
                <span className="material-symbols-outlined text-2xl">flash_on</span>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <p className="text-label-sm text-slate-400 uppercase mb-2">Queue Status</p>
                {loading ? (
                  <Pulse className="h-6 w-40 mb-4 bg-slate-700" />
                ) : (
                  <p className="text-h3 font-h3 text-white mb-4">{engine.queue_status}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-label-sm">
                    <span className="text-slate-400">Screening Progress</span>
                    <span className="text-white font-semibold">
                      {loading ? '—' : `${engine.processing_load}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-200 transition-all duration-500"
                      style={{ width: loading ? '0%' : `${engine.processing_load}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                AI Insights
              </h3>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Pulse className="w-5 h-5 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Pulse className="h-3 w-full" />
                        <Pulse className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : aiInsights.length === 0 ? (
                <p className="text-sm text-slate-400">No insights available yet. Upload and screen candidates to generate AI insights.</p>
              ) : (
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className={`material-symbols-outlined text-lg flex-shrink-0 ${insightColor[insight.type] || 'text-slate-500'}`}>
                        {insight.icon}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
