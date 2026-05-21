import React, { useState } from 'react';
import Layout from '../components/Layout';

const Ranking = () => {
  const storedResults = (() => {
    try {
      const raw = localStorage.getItem('ranked_candidates');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.ranked_candidates ? parsed.ranked_candidates : null;
    } catch (err) {
      return null;
    }
  })();

  const fallbackTop = [
    {
      rank: 1,
      name: 'Sarah Jenkins',
      title: 'Lead UX Architect',
      experience: '8 Years Exp.',
      score: 98,
      badge: 'HIGHLY RECOMMENDED',
      badgeBg: 'bg-green-50',
      badgeText: 'text-green-700',
      badgeBorder: 'border-green-100',
      strength: 'Exceptional mastery of complex design systems and multi-platform orchestration. Strong leadership signals in stakeholder management and rapid prototyping under high pressure.'
    },
    {
      rank: 2,
      name: 'Marcus Thorne',
      title: 'Senior Product Designer',
      experience: '6 Years Exp.',
      score: 94,
      badge: 'TOP 5% TALENT',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-100',
      strength: 'Advanced analytical skills with a focus on conversion-driven design. Significant experience in Fintech scaling. Excellent technical proficiency in modern toolsets.'
    },
    {
      rank: 3,
      name: 'Elara Vance',
      title: 'Visual Design Specialist',
      experience: '10 Years Exp.',
      score: 91,
      badge: 'STRONG MATCH',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-600',
      badgeBorder: 'border-slate-100',
      strength: 'Highest score in visual aesthetics and brand coherence. Extensive portfolio in luxury retail. Potential gap in high-density enterprise dashboard experience.'
    },
  ];

  const scoreBadge = (score) => {
    if (score >= 85) return { badge: 'HIGHLY RECOMMENDED', badgeBg: 'bg-green-50', badgeText: 'text-green-700', badgeBorder: 'border-green-100' };
    if (score >= 70) return { badge: 'STRONG MATCH', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', badgeBorder: 'border-blue-100' };
    return { badge: 'MODERATE MATCH', badgeBg: 'bg-slate-50', badgeText: 'text-slate-600', badgeBorder: 'border-slate-100' };
  };

  const rankedCandidates = storedResults
    ? storedResults.slice(0, 3).map((candidate, index) => {
      const score = Math.round(candidate.overall_score || 0);
      const badge = scoreBadge(score);
      return {
        rank: candidate.rank || index + 1,
        name: candidate.name || 'Candidate',
        title: candidate.predicted_category || 'Candidate',
        experience: candidate.experience_text ? 'Experience listed' : 'Experience not provided',
        score,
        strength: candidate.insight || 'No insight generated yet.',
        ...badge
      };
    })
    : fallbackTop;

  const remainingCandidates = storedResults
    ? storedResults.slice(3).map((candidate) => ({
      rank: candidate.rank,
      name: candidate.name || 'Candidate',
      experience: candidate.predicted_category || 'Candidate',
      score: Math.round(candidate.overall_score || 0)
    }))
    : [
      { rank: 4, name: 'David Chen', experience: '5 Yrs • Mobile First', score: 88 },
      { rank: 5, name: 'Sofia Rodriguez', experience: '7 Yrs • SaaS Expert', score: 85 },
    ];

  const [shortlist] = useState([
    { name: 'Sarah Jenkins', score: '98%', avatar: '1' },
    { name: 'Marcus Thorne', score: '94%', avatar: '2' },
  ]);

  return (
    <Layout title="Candidate Ranking">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <nav className="flex items-center space-x-2 text-label-sm text-slate-400 mb-3">
            <span>Recruitment</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Senior Product Designer</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">Candidate Ranking</span>
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Senior Product Designer Ranking</h1>
              <p className="text-body-md text-secondary">AI-driven assessment based on 124 applicants for the Engineering Hub expansion.</p>
            </div>
            <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span>Adjust Weighting</span>
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center space-x-2">
              <span className="material-symbols-outlined text-sm">ios_share</span>
              <span>Export Report</span>
            </button>
          </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: Candidate Ranking List */}
          <div className="col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 py-1">
              <h3 className="font-h3 text-primary">Ranked Candidates ({rankedCandidates.length})</h3>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-secondary font-medium">Sorted by: <strong className="text-primary">Match Score</strong></span>
              </div>
            </div>

            {/* Top 3 Rank Cards */}
            {rankedCandidates.map((candidate) => (
              <div key={candidate.rank} className="bg-white rounded-xl border border-slate-200 p-6 flex items-start space-x-6 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  #{candidate.rank}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{candidate.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">{candidate.title} • {candidate.experience}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <span className={`px-2 py-0.5 ${candidate.badgeBg} ${candidate.badgeText} text-[10px] font-bold uppercase rounded tracking-wider border ${candidate.badgeBorder}`}>
                          {candidate.badge}
                        </span>
                        <span className="text-2xl font-bold text-primary">{candidate.score}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">Match Accuracy</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Strengths</p>
                      <p className="text-sm text-slate-600 italic leading-relaxed">"{candidate.strength}"</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-all">
                        <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
                        <span>Shortlist</span>
                      </button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-50">View Dossier</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Zebra Striped Table for lower rankings */}
            <div className="mt-12 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">Next Recommended (4-15)</h4>
                <button className="text-xs font-bold text-primary hover:underline">View All Candidates</button>
              </div>
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Experience</th>
                    <th className="px-6 py-3">AI Score</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remainingCandidates.map((candidate, idx) => (
                    <tr key={candidate.rank} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50 transition-colors`}>
                      <td className="px-6 py-4 font-bold text-slate-400">#{candidate.rank}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{candidate.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{candidate.experience}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{width: `${candidate.score}%`}}></div>
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
            </div>
          </div>

          {/* Right: Shortlist Panel */}
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

                {/* Shortlist Items */}
                <div className="p-2 space-y-1">
                  {shortlist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {item.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500">Rank #1 • {item.score}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all">
                Finalize Shortlist
              </button>
              <button className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">
                Request Internal Review
              </button>

              {/* Selection Metrics */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Selection Metrics</h4>
                <div className="space-y-2">
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
                  <div className="pt-2 border-t border-slate-200">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{width: '75%'}}></div>
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
