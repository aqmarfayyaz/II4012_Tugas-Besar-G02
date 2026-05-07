import React, { useState } from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  // Mock data
  const dashboardData = {
    totalApplicants: { value: 1240, change: 12 },
    candidatesScreened: { value: 856, change: 8 },
    shortlisted: { value: 142, change: -3 },
    avgMatchScore: { value: 78, change: 2 },
    timeToScreen: { value: 4.2, unit: 'm', change: 5 },
    jobCategories: [
      { category: 'Engineering', count: 482, color: 'bg-slate-900' },
      { category: 'Product', count: 245, color: 'bg-slate-600' },
      { category: 'Design', count: 158, color: 'bg-slate-400' },
      { category: 'Sales', count: 357, color: 'bg-blue-400' },
    ],
    scoreDistribution: [
      { range: 'LOW (0-40)', count: 125, color: 'bg-slate-300' },
      { range: 'MEDIUM', count: 485, color: 'bg-slate-700' },
      { range: 'HIGH (80+)', count: 246, color: 'bg-slate-900' },
    ],
    matchQuality: {
      analyzed: 856,
      highMatch: 25,
      mediumMatch: 45,
      lowMatch: 30,
    },
    latestSubmissions: [
      { id: 'AM', name: 'Alex Mercer', position: 'Senior Engineer', time: '2 mins ago', status: 'GREEN MATCH' },
      { id: 'SK', name: 'Sarah Koenig', position: 'Product Lead', time: '14 mins ago', status: 'YELLOW' },
      { id: 'DW', name: 'David Wright', position: 'UX Designer', time: '45 mins ago', status: 'LOW MATCH' },
      { id: 'LT', name: 'Linda Thompson', position: 'Sales Manager', time: '1 hour ago', status: 'GREEN MATCH' },
    ],
    systemEngine: {
      queueStatus: '12 jobs in queue',
      processingLoad: 64,
    },
    aiInsights: [
      { type: 'match', text: 'Top match identified for Senior Developer role. Confidence: 94%', icon: 'check_circle' },
      { type: 'trend', text: 'Engineering category size is 15% surge in applicants today.', icon: 'trending_up' },
      { type: 'alert', text: 'Match quality for Design roles is 3% lower than average.', icon: 'warning' },
    ],
  };

  return (
    <Layout title="Dashboard">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Dashboard Overview</h1>
            <p className="text-body-md text-secondary mt-1">Real-time recruitment performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              📅 {timeRange}
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards (5 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Total Applicants</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-h2 font-h2 text-primary">{dashboardData.totalApplicants.value.toLocaleString()}</h3>
              <span className="text-label-sm text-green-600 font-semibold">↑ {dashboardData.totalApplicants.change}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Candidates Screened</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-h2 font-h2 text-primary">{dashboardData.candidatesScreened.value}</h3>
              <span className="text-label-sm text-green-600 font-semibold">↑ {dashboardData.candidatesScreened.change}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Shortlisted</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-h2 font-h2 text-primary">{dashboardData.shortlisted.value}</h3>
              <span className="text-label-sm text-red-600 font-semibold">↓ {Math.abs(dashboardData.shortlisted.change)}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Avg Match Score</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-h2 font-h2 text-primary">{dashboardData.avgMatchScore.value}%</h3>
              <span className="text-label-sm text-green-600 font-semibold">↑ {dashboardData.avgMatchScore.change}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold mb-2">Time-to-Screen</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-h2 font-h2 text-primary">{dashboardData.timeToScreen.value}{dashboardData.timeToScreen.unit}</h3>
              <span className="text-label-sm text-green-600 font-semibold">↑ {dashboardData.timeToScreen.change}%</span>
            </div>
          </div>
        </div>

        {/* Charts Grid (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates by Job Category */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Candidates by Job Category</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.jobCategories.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 font-medium">{cat.category}</span>
                    <span className="text-sm font-semibold text-slate-900">{cat.count}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${(cat.count / 482) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Score Distribution</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">bar_chart</span>
              </button>
            </div>
            <div className="flex items-end justify-center gap-3 h-48">
              {dashboardData.scoreDistribution.map((dist, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-full ${dist.color} rounded-t-lg`} style={{ height: `${(dist.count / 485) * 150}px` }}></div>
                  <span className="text-[10px] text-slate-600 font-medium mt-2 text-center">{dist.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match Quality - Donut Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Match Quality</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">pie_chart</span>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-32 h-32 mb-4" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#091426"
                  strokeWidth="8"
                  strokeDasharray={`${(dashboardData.matchQuality.highMatch / 100) * (2 * Math.PI * 45)} ${2 * Math.PI * 45}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <p className="text-h3 font-h3 text-slate-900">{dashboardData.matchQuality.analyzed}</p>
              <p className="text-label-sm text-slate-600">ANALYZED</p>
              <div className="mt-4 space-y-2 w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    High Match
                  </span>
                  <span className="font-semibold">{dashboardData.matchQuality.highMatch}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Medium Match
                  </span>
                  <span className="font-semibold">{dashboardData.matchQuality.mediumMatch}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    Low Match
                  </span>
                  <span className="font-semibold">{dashboardData.matchQuality.lowMatch}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Latest Submissions & System Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest CV Submissions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-body-md font-semibold text-primary">Latest CV Submissions</h3>
              <button className="text-primary text-sm font-semibold hover:underline">View All</button>
            </div>
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
                  {dashboardData.latestSubmissions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">{sub.id}</div>
                          <span className="text-slate-900 font-medium">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sub.position}</td>
                      <td className="px-4 py-3 text-slate-600">{sub.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          sub.status === 'GREEN MATCH' ? 'bg-green-100 text-green-700' :
                          sub.status === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: System Engine & AI Insights */}
          <div className="space-y-6">
            {/* System Engine */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 text-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-body-md font-semibold">System Engine</h3>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-white text-label-sm font-semibold rounded">● ACTIVE</span>
                </div>
                <span className="material-symbols-outlined text-2xl">flash_on</span>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <p className="text-label-sm text-slate-400 uppercase mb-2">Queue Status</p>
                <p className="text-h3 font-h3 text-white mb-4">{dashboardData.systemEngine.queueStatus}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-label-sm">
                    <span className="text-slate-400">Current Processing Load</span>
                    <span className="text-white font-semibold">{dashboardData.systemEngine.processingLoad}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200" style={{ width: `${dashboardData.systemEngine.processingLoad}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                AI Insights
              </h3>
              <div className="space-y-3">
                {dashboardData.aiInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className={`material-symbols-outlined text-lg flex-shrink-0 ${
                      insight.type === 'match' ? 'text-green-600' :
                      insight.type === 'trend' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {insight.icon}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
