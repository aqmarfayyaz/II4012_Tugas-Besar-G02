import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getScreeningResults } from '../services/api';

/* ── helpers ────────────────────────────────────────────────── */
const scoreBadge = (score) => {
  if (score >= 80) return { badge: 'HIGHLY RECOMMENDED', badgeBg: 'bg-green-50', badgeText: 'text-green-700', badgeBorder: 'border-green-100' };
  if (score >= 65) return { badge: 'STRONG MATCH',       badgeBg: 'bg-blue-50',  badgeText: 'text-blue-700',  badgeBorder: 'border-blue-100' };
  if (score >= 45) return { badge: 'MODERATE MATCH',     badgeBg: 'bg-yellow-50',badgeText: 'text-yellow-700',badgeBorder: 'border-yellow-100' };
  return             { badge: 'LOW MATCH',               badgeBg: 'bg-slate-50', badgeText: 'text-slate-600', badgeBorder: 'border-slate-100' };
};

const ScoreBar = ({ label, value, color = 'bg-primary' }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
    <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(value)}%</span>
  </div>
);

/* ── fallback static data (kept as requested) ───────────────── */
const FALLBACK_TOP = [
  {
    rank: 1, name: 'Sarah Jenkins', title: 'Lead UX Architect', experience: '8 Years Exp.',
    score: 98, badge: 'HIGHLY RECOMMENDED', badgeBg: 'bg-green-50', badgeText: 'text-green-700', badgeBorder: 'border-green-100',
    strength: 'Exceptional mastery of complex design systems and multi-platform orchestration.',
    similarity_score: 95, skill_score: 100, predicted_category: 'CREATIVE',
    skill_details: { matched_skills: ['Figma', 'UX Research', 'Prototyping'], missing_skills: [] },
  },
  {
    rank: 2, name: 'Marcus Thorne', title: 'Senior Product Designer', experience: '6 Years Exp.',
    score: 94, badge: 'TOP 5% TALENT', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', badgeBorder: 'border-blue-100',
    strength: 'Advanced analytical skills with a focus on conversion-driven design.',
    similarity_score: 90, skill_score: 97, predicted_category: 'CREATIVE',
    skill_details: { matched_skills: ['Figma', 'Adobe XD'], missing_skills: ['Framer'] },
  },
  {
    rank: 3, name: 'Elara Vance', title: 'Visual Design Specialist', experience: '10 Years Exp.',
    score: 91, badge: 'STRONG MATCH', badgeBg: 'bg-slate-50', badgeText: 'text-slate-600', badgeBorder: 'border-slate-100',
    strength: 'Highest score in visual aesthetics. Potential gap in enterprise dashboard experience.',
    similarity_score: 85, skill_score: 88, predicted_category: 'CREATIVE',
    skill_details: { matched_skills: ['Illustrator', 'Branding'], missing_skills: ['Figma'] },
  },
];

/* ── component ───────────────────────────────────────────────── */
const Ranking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useAuth();

  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [remainingCandidates, setRemainingCandidates] = useState([]);
  const [meta, setMeta] = useState({ job_category: '', total_candidates: 0 });
  const [isRealData, setIsRealData] = useState(false);
  const [shortlist, setShortlist] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyResults, setHistoryResults] = useState([]);
  const [activeHistoryIdx, setActiveHistoryIdx] = useState(null);

  /* load results: location.state > localStorage > API */
  const applyResults = (data) => {
    if (!data?.ranked_candidates?.length) return;
    const all = data.ranked_candidates;
    setMeta({ job_category: data.job_category || '', total_candidates: data.total_candidates || all.length });
    setRankedCandidates(all.slice(0, 3).map((c, i) => {
      const score = Math.round(c.overall_score || 0);
      return {
        rank: c.rank || i + 1,
        name: c.name || 'Candidate',
        title: c.predicted_category || 'Candidate',
        experience: c.skill_details ? `${c.skill_details.required_matched || 0}/${c.skill_details.required_total || 0} skills matched` : 'Skills not evaluated',
        score,
        similarity_score: c.similarity_score || 0,
        skill_score: c.skill_score || 0,
        predicted_category: c.predicted_category || '',
        skill_details: c.skill_details || {},
        insight: c.insight || '',
        skills: c.skills || [],
        email: c.email || '',
        ...scoreBadge(score),
      };
    }));
    setRemainingCandidates(all.slice(3).map((c) => ({
      rank: c.rank,
      name: c.name || 'Candidate',
      experience: c.predicted_category || '',
      score: Math.round(c.overall_score || 0),
    })));
    setIsRealData(true);
  };

  useEffect(() => {
    // 1. From navigation state (just ran screening)
    if (location.state?.results) {
      applyResults(location.state.results);
      return;
    }
    // 2. From localStorage
    try {
      const raw = localStorage.getItem('ranked_candidates');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.ranked_candidates?.length) {
        applyResults(parsed);
        return;
      }
    } catch (_) {}
    // 3. From API (Firestore)
    if (currentProject?.id) {
      setLoadingHistory(true);
      getScreeningResults(currentProject.id)
        .then((res) => {
          const results = res.data?.data?.results || [];
          setHistoryResults(results);
          if (results.length > 0) {
            applyResults(results[0]);
            setActiveHistoryIdx(0);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [location.state, currentProject?.id]);

  // Real data takes full priority; static fallback only when no real data at all
  const displayTop = rankedCandidates.length > 0 ? rankedCandidates : FALLBACK_TOP;
  const displayRemaining = remainingCandidates.length > 0
    ? remainingCandidates
    : isRealData
      ? []   // real run with < 4 candidates — no fake rows
      : [
          { rank: 4, name: 'David Chen',      experience: '5 Yrs · Mobile First', score: 88 },
          { rank: 5, name: 'Sofia Rodriguez', experience: '7 Yrs · SaaS Expert',  score: 85 },
        ];

  const handleShortlist = (candidate) => {
    if (shortlist.find((s) => s.name === candidate.name)) return;
    setShortlist((prev) => [...prev, { name: candidate.name, score: `${candidate.score}%` }]);
  };

  return (
    <Layout title="Candidate Ranking">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <nav className="flex items-center space-x-2 text-label-sm text-slate-400 mb-3">
            <span>Recruitment</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">Candidate Ranking</span>
            {isRealData && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded ml-2">
                LIVE MODEL DATA
              </span>
            )}
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {currentProject?.job_title || 'Candidate'} Ranking
              </h1>
              <p className="text-body-md text-secondary">
                {isRealData
                  ? `AI-driven assessment · ${meta.total_candidates} candidate(s) · Job category: ${meta.job_category || 'N/A'}`
                  : 'AI-driven assessment based on 124 applicants for the Engineering Hub expansion.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>New Screening</span>
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center space-x-2">
                <span className="material-symbols-outlined text-sm">ios_share</span>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* History bar (Firestore results) */}
        {historyResults.length > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-label-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Screening History</p>
            <div className="flex gap-2 flex-wrap">
              {historyResults.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => { applyResults(r); setActiveHistoryIdx(idx); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeHistoryIdx === idx ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : `Session ${idx + 1}`} · {r.total_candidates || '?'} candidates
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No data state */}
        {!isRealData && !loadingHistory && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-600">info</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Showing demo data</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Run a screening from the <button onClick={() => navigate('/upload')} className="underline font-bold">Upload page</button> to see real model results here.
              </p>
            </div>
          </div>
        )}

        {loadingHistory && (
          <div className="text-center py-6 text-slate-500 text-sm">Loading previous results...</div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: Candidate Ranking List */}
          <div className="col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 py-1">
              <h3 className="font-h3 text-primary">Ranked Candidates ({displayTop.length})</h3>
              <span className="text-xs text-secondary font-medium">Sorted by: <strong className="text-primary">Match Score</strong></span>
            </div>

            {/* Top Cards */}
            {displayTop.map((candidate) => (
              <div key={candidate.rank} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    #{candidate.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Name + Score */}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight">{candidate.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-slate-500 font-medium">{candidate.title}</p>
                          {candidate.predicted_category && candidate.predicted_category !== candidate.title && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded">
                              {candidate.predicted_category}
                            </span>
                          )}
                        </div>
                        {candidate.email && <p className="text-xs text-slate-400 mt-0.5">{candidate.email}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          <span className={`px-2 py-0.5 ${candidate.badgeBg} ${candidate.badgeText} text-[10px] font-bold uppercase rounded tracking-wider border ${candidate.badgeBorder}`}>
                            {candidate.badge}
                          </span>
                          <span className="text-2xl font-bold text-primary">{candidate.score}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">Overall Match</p>
                      </div>
                    </div>

                    {/* Score Breakdown — real data only */}
                    {isRealData && (
                      <div className="mt-3 space-y-1.5 p-3 bg-slate-50 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Score Breakdown</p>
                        <ScoreBar label="Semantic"   value={candidate.similarity_score} color="bg-blue-500" />
                        <ScoreBar label="Skill Match" value={candidate.skill_score}      color="bg-green-500" />
                        <ScoreBar label="Overall"    value={candidate.score}             color="bg-primary" />
                      </div>
                    )}

                    {/* Skill Details */}
                    {isRealData && candidate.skill_details && (
                      <div className="mt-3 space-y-1">
                        {candidate.skill_details.matched_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] font-bold text-green-700 uppercase flex-shrink-0">Matched:</span>
                            {candidate.skill_details.matched_skills.map((s, si) => (
                              <span key={si} className="px-1.5 py-0.5 bg-green-50 border border-green-200 text-[10px] text-green-700 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                        {candidate.skill_details.missing_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] font-bold text-red-600 uppercase flex-shrink-0">Missing:</span>
                            {candidate.skill_details.missing_skills.map((s, si) => (
                              <span key={si} className="px-1.5 py-0.5 bg-red-50 border border-red-200 text-[10px] text-red-600 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skills of candidate */}
                    {isRealData && candidate.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 8).map((s, si) => (
                          <span key={si} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-600 rounded">{s}</span>
                        ))}
                        {candidate.skills.length > 8 && <span className="text-[10px] text-slate-400">+{candidate.skills.length - 8}</span>}
                      </div>
                    )}

                    {/* Experience / Insight */}
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {isRealData ? 'AI Insight' : 'Key Strengths'}
                        </p>
                        <p className="text-sm text-slate-600 italic leading-relaxed">
                          "{candidate.insight || candidate.strength}"
                        </p>
                        {isRealData && (
                          <p className="text-xs text-slate-400 mt-1">{candidate.experience}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 flex-shrink-0">
                        <button
                          onClick={() => handleShortlist(candidate)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold flex items-center justify-center space-x-1 hover:opacity-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>Shortlist</span>
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-50">
                          View Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Remaining table */}
            <div className="mt-12 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">
                  {isRealData ? `Other Candidates (rank 4+)` : 'Next Recommended (4-15)'}
                </h4>
                <button className="text-xs font-bold text-primary hover:underline">View All Candidates</button>
              </div>
              {displayRemaining.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">AI Score</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayRemaining.map((candidate, idx) => (
                      <tr key={candidate.rank} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50 transition-colors`}>
                        <td className="px-6 py-4 font-bold text-slate-400">#{candidate.rank}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{candidate.name}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{candidate.experience}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${candidate.score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{candidate.score}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:text-primary-container p-1 rounded transition-colors">
                            <span className="material-symbols-outlined">add_circle</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">No additional candidates.</div>
              )}
            </div>
          </div>

          {/* Right: Shortlist */}
          <div className="col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold">Current Shortlist</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Round 3: Stakeholder Review</p>
                  </div>
                  <div className="bg-white/10 px-2 py-1 rounded text-xs font-bold">{shortlist.length}/5 Slots</div>
                </div>
                <div className="p-2 space-y-1">
                  {shortlist.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No candidates shortlisted yet</p>
                  ) : shortlist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500">Rank #{idx + 1} · {item.score}</p>
                        </div>
                      </div>
                      <button onClick={() => setShortlist((prev) => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all">
                Finalize Shortlist
              </button>
              <button className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">
                Request Internal Review
              </button>

              {/* Selection Metrics */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {isRealData ? 'Model Metrics' : 'Selection Metrics'}
                </h4>
                <div className="space-y-2">
                  {isRealData ? (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Total Candidates</span>
                        <span className="font-bold text-primary">{meta.total_candidates}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Top Score</span>
                        <span className="font-bold text-primary">{displayTop[0]?.score || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Job Category</span>
                        <span className="font-bold text-primary">{meta.job_category || 'N/A'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Current Fit</span>
                        <span className="font-bold text-primary">8.4/10</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Skill Agreement</span>
                        <span className="font-bold text-primary">92%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Time-to-Hire Potential</span>
                        <span className="font-bold text-primary">High</span>
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${isRealData ? (displayTop[0]?.score || 0) : 75}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Ranking;
