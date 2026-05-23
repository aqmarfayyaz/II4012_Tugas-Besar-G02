import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, exportAnalyticsCsv } from '../services/api';

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 0 },
];

const Analytics = () => {
  const { currentProject } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState(RANGES[1]);
  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { days: range.days };
      if (currentProject?.id) params.project_id = currentProject.id;
      const resp = await getAnalytics(params);
      const payload = resp.data?.data || resp.data;
      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [range.days, currentProject?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportAnalyticsCsv(currentProject?.id || '');
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentpulse_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const filteredDepts = (data?.departments || []).filter(d =>
    !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2"><Pulse className="h-8 w-64" /><Pulse className="h-4 w-48" /></div>
            <div className="flex gap-3"><Pulse className="h-10 w-36" /><Pulse className="h-10 w-36" /></div>
          </div>
          <Pulse className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <Pulse className="h-3 w-40 mb-4" /><Pulse className="h-10 w-28 mb-4" />
              <Pulse className="h-3 w-32" />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
              <Pulse className="h-4 w-56 mb-4" />
              <div className="flex items-end gap-1 h-32">
                {[...Array(8)].map((_, i) => (
                  <Pulse key={i} className="flex-1" style={{ height: `${40 + Math.random() * 60}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <Pulse className="h-4 w-48 mb-6" />
                {[...Array(4)].map((_, j) => <Pulse key={j} className="h-10 w-full mb-3" />)}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Analytics">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data || data.total_candidates === 0) {
    return (
      <Layout title="Analytics">
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-h1 font-h1 text-primary">Recruitment Intelligence</h1>
              <p className="text-body-md text-secondary mt-1">Real-time performance metrics and AI-driven efficiency modeling</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">insights</span>
            <p className="text-body-md text-slate-600 mb-1">No data yet to analyze.</p>
            <p className="text-sm text-slate-400">Upload CVs and run AI screening to see analytics here.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    total_candidates = 0,
    screened_candidates = 0,
    shortlisted = 0,
    interviewed = 0,
    avg_match_score = 0,
    ai_accuracy = 0,
    screening_coverage = 0,
    screening_sessions = 0,
    projects_count = 0,
    score_distribution = { high: 0, medium: 0, low: 0 },
    funnel = [],
    score_trend = [],
    departments = [],
    top_skills = [],
    candidates_by_status = {},
  } = data;

  const distTotal = score_distribution.high + score_distribution.medium + score_distribution.low;
  const distHighPct  = distTotal > 0 ? Math.round(score_distribution.high   / distTotal * 100) : 0;
  const distMedPct   = distTotal > 0 ? Math.round(score_distribution.medium / distTotal * 100) : 0;
  const distLowPct   = distTotal > 0 ? Math.round(score_distribution.low    / distTotal * 100) : 0;

  const maxTrend = score_trend.length > 0 ? Math.max(...score_trend.map(p => p.avg_score), 1) : 100;

  return (
    <Layout title="Analytics">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Recruitment Intelligence</h1>
            <p className="text-body-md text-secondary mt-1">
              Real-time performance metrics · {currentProject ? currentProject.name : 'All Projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">

            <div className="relative">
              <button
                onClick={() => setShowRangeMenu(v => !v)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                {range.label}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              {showRangeMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                  {RANGES.map(r => (
                    <button
                      key={r.label}
                      onClick={() => { setRange(r); setShowRangeMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50
                        ${r.label === range.label ? 'font-semibold text-primary' : 'text-slate-700'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-sm">
                {exporting ? 'hourglass_empty' : 'download'}
              </span>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-xl">search</span>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Candidates', value: total_candidates, icon: 'group' },
            { label: 'AI Screened', value: screened_candidates, icon: 'smart_toy' },
            { label: 'Shortlisted', value: shortlisted, icon: 'star' },
            { label: 'Avg Match Score', value: avg_match_score > 0 ? `${avg_match_score}%` : '—', icon: 'percent' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold">{item.label}</p>
                <span className="material-symbols-outlined text-slate-300 text-xl">{item.icon}</span>
              </div>
              <h3 className="text-h2 font-h2 text-primary">{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold">AI Matching Accuracy</p>
                <h2 className="text-h1 font-h1 text-primary mt-3">
                  {screened_candidates > 0 ? `${ai_accuracy}%` : '—'}
                </h2>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-3xl">trending_up</span>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-1.5 text-label-sm text-slate-600">
              <div className="flex justify-between">
                <span>Screening Coverage</span>
                <span className="font-semibold text-slate-800">{screening_coverage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Sessions Run</span>
                <span className="font-semibold text-slate-800">{screening_sessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects Active</span>
                <span className="font-semibold text-slate-800">{projects_count}</span>
              </div>
              {screened_candidates === 0 && (
                <p className="text-slate-400 text-xs mt-1">Run AI screening to see accuracy metrics.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
            <h3 className="text-body-md font-semibold text-primary mb-4 flex items-center justify-between">
              <span>Match Score Trend</span>
              <div className="flex items-center gap-3 text-label-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  Avg Match %
                </span>
              </div>
            </h3>
            {score_trend.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-sm text-slate-400">
                No screened candidates yet — scores will appear here after running AI screening.
              </div>
            ) : (
              <div className="h-32 flex items-end justify-between gap-1">
                {score_trend.map((point, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-sm transition-all"
                      style={{ height: `${Math.max(4, (point.avg_score / maxTrend) * 100)}%` }}
                    />

                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {point.avg_score}% · {point.count} candidates
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{point.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Screening Coverage</p>
              <h2 className="text-h1 font-h1 text-primary mt-3">{screening_coverage}%</h2>
              <p className="text-label-sm text-slate-600 mt-2">
                {screened_candidates} of {total_candidates} uploaded candidates have been processed by the AI screening pipeline.
                {total_candidates - screened_candidates > 0 && (
                  <span className="text-amber-600 font-semibold ml-1">
                    {total_candidates - screened_candidates} pending screening.
                  </span>
                )}
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-300 text-3xl">verified_user</span>
          </div>

          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${screening_coverage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-6">Conversion Pipeline — Candidate Funnel</h3>
            {funnel.length === 0 ? (
              <p className="text-sm text-slate-400">Upload candidates to see the funnel.</p>
            ) : (
              <div className="space-y-4">
                {funnel.map((stage, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-body-md text-slate-700 font-medium">{stage.stage}</span>
                      <span className="text-label-sm font-semibold text-primary">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${Math.max(stage.percentage, 2)}%` }}
                        >
                          {stage.percentage > 20 && (
                            <span className="text-label-sm font-bold text-white">{stage.percentage}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-label-sm text-slate-600 font-semibold w-10 text-right">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-6">Score Distribution — AI Screening Results</h3>
            {screened_candidates === 0 ? (
              <p className="text-sm text-slate-400">Run AI screening to see score distribution.</p>
            ) : (
              <div className="space-y-6">

                {[
                  { label: 'High Match (≥80%)', count: score_distribution.high, pct: distHighPct, color: 'bg-green-500' },
                  { label: 'Medium Match (40–79%)', count: score_distribution.medium, pct: distMedPct, color: 'bg-blue-400' },
                  { label: 'Low Match (<40%)', count: score_distribution.low, pct: distLowPct, color: 'bg-slate-300' },
                ].map(({ label, count, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-body-md text-slate-700 font-medium">{label}</span>
                      <span className={`px-2 py-0.5 rounded text-label-sm font-semibold ${
                        color === 'bg-green-500' ? 'bg-green-100 text-green-700' :
                        color === 'bg-blue-400'  ? 'bg-blue-100 text-blue-700'  :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {pct}% ({count})
                      </span>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 text-center text-label-sm">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{avg_match_score}%</p>
                    <p className="text-slate-400">Avg Score</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{screened_candidates}</p>
                    <p className="text-slate-400">Screened</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{shortlisted}</p>
                    <p className="text-slate-400">Shortlisted</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {top_skills.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">
              Top Required Skills — from Job Descriptions
            </h3>
            <div className="flex flex-wrap gap-2">
              {top_skills.map(({ skill, count }) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  {skill}
                  <span className="bg-slate-300 text-slate-600 rounded-full px-1.5 py-0.5 text-[10px]">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-body-md font-semibold text-primary">Departmental Analytics</h3>
            <span className="text-label-sm text-slate-400">{filteredDepts.length} department{filteredDepts.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredDepts.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              {searchTerm ? `No departments matching "${searchTerm}".` : 'No department data available.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Department</th>
                    <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Projects</th>
                    <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Candidates</th>
                    <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Avg Score</th>
                    <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Matching Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.map((dept, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">domain</span>
                          <span className="text-body-md text-slate-900 font-medium">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-body-md text-slate-700">
                        {dept.roles} position{dept.roles !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4 text-body-md text-slate-700">
                        {dept.candidates} candidate{dept.candidates !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4 text-body-md text-slate-700">
                        {dept.avg_score > 0 ? `${dept.avg_score}%` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${dept.quality}%` }}
                            />
                          </div>
                          <span className="text-label-sm font-semibold text-slate-700">
                            {dept.quality > 0 ? `${dept.quality}%` : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Analytics;
