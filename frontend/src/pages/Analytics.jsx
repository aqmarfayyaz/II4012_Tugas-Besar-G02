import React, { useState } from 'react';
import Layout from '../components/Layout';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [searchTerm, setSearchTerm] = useState('');

  const analyticsData = {
    aiMatchingAccuracy: 98.2,
    historicalBenchmark: 95.8,
    biasMitigationScore: 99.9,
    timeToHireTrend: [
      { month: 'JAN', value: 18 },
      { month: 'FEB', value: 19.2 },
      { month: 'MAR', value: 18.8 },
      { month: 'APR', value: 17.5 },
      { month: 'MAY', value: 16.2 },
      { month: 'JUN', value: 15.8 },
      { month: 'JUL', value: 15.2 },
      { month: 'AUG', value: 14.9 },
      { month: 'SEP', value: 14.5 },
      { month: 'OCT', value: 13.8 },
      { month: 'NOV', value: 13.2 },
      { month: 'DEC', value: 12.5 },
    ],
    funnel: [
      { stage: 'Sourced', count: 12460, percentage: 100 },
      { stage: 'Screened', count: 4120, percentage: 33 },
      { stage: 'Shortlisted', count: 845, percentage: 20 },
      { stage: 'Interviewed', count: 210, percentage: 25 },
      { stage: 'Hired', count: 48, percentage: 23 },
    ],
    aiVsManual: {
      hoursPerVacancy: { ai: 2.3, manual: 45.0, improvement: 98 },
      costPerHire: { ai: 84.2, manual: 1480, improvement: 94 },
    },
    departments: [
      { name: 'Engineering', roles: 12, avgTimeToHire: '14.2 Days', quality: 84 },
      { name: 'Product Finance', roles: 4, avgTimeToHire: '18.5 Days', quality: 86 },
    ],
  };

  return (
    <Layout title="Analytics">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Recruitment Intelligence</h1>
            <p className="text-body-md text-secondary mt-1">Real-time performance metrics and AI-driven efficiency modeling.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              {timeRange}
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Report
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-secondary text-xl">search</span>
          <input
            type="text"
            placeholder="Search analytics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        {/* Top Metrics Grid (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Matching Accuracy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold">AI Matching Accuracy</p>
                <h2 className="text-h1 font-h1 text-primary mt-3">{analyticsData.aiMatchingAccuracy}%</h2>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-3xl">trending_up</span>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <p className="text-label-sm text-slate-600">Historical Benchmark</p>
              <span className="text-label-sm font-semibold text-slate-700">{analyticsData.historicalBenchmark}%</span>
            </div>
          </div>

          {/* Time-to-Hire Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
            <h3 className="text-body-md font-semibold text-primary mb-4 flex items-center justify-between">
              <span>Time-to-Hire Trend - Efficiency Velocity</span>
              <div className="flex items-center gap-3 text-label-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Current
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  2023 Average
                </span>
              </div>
            </h3>
            <div className="h-32 flex items-end justify-between gap-1">
              {analyticsData.timeToHireTrend.map((point, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-sm" style={{ height: `${(point.value / 20) * 100}px` }}></div>
                  <span className="text-[10px] text-slate-500 font-medium">{point.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bias Mitigation Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Bias Mitigation Score</p>
              <h2 className="text-h1 font-h1 text-primary mt-3">{analyticsData.biasMitigationScore}%</h2>
              <p className="text-label-sm text-slate-600 mt-2">Neutrally calibrated across 15 protected demographics in latest audit cycle</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 text-3xl">verified_user</span>
          </div>
        </div>

        {/* Second Row: Funnel & AI vs Manual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Pipeline - Candidate Funnel Visualization */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-6">Conversion Pipeline - Candidate Funnel Visualization</h3>
            <div className="space-y-4">
              {analyticsData.funnel.map((stage, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-body-md text-slate-700 font-medium">{stage.stage}</span>
                    <span className="text-label-sm font-semibold text-primary">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-end pr-3"
                        style={{ width: `${stage.percentage}%` }}
                      >
                        {stage.percentage > 20 && (
                          <span className="text-label-sm font-bold text-white">{stage.percentage}% CONV.</span>
                        )}
                      </div>
                    </div>
                    <span className="text-label-sm text-slate-600 font-semibold w-16 text-right">{stage.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process Efficiency: AI vs Manual Screening */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-6">Process Efficiency - AI vs Manual Screening</h3>
            <div className="space-y-6">
              {/* Hours per Vacancy */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body-md text-slate-700 font-medium">Hours per Vacancy</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-label-sm font-semibold rounded">
                    {analyticsData.aiVsManual.hoursPerVacancy.improvement}% improvement
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="h-16 bg-slate-900 rounded-lg mb-2"></div>
                    <p className="text-label-sm text-slate-600 font-medium">{analyticsData.aiVsManual.hoursPerVacancy.ai}h</p>
                    <p className="text-label-sm text-slate-400">RecruitOS AI</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-64 bg-slate-200 rounded-lg mb-2"></div>
                    <p className="text-label-sm text-slate-600 font-medium">{analyticsData.aiVsManual.hoursPerVacancy.manual}h</p>
                    <p className="text-label-sm text-slate-400">Legacy Manual</p>
                  </div>
                </div>
              </div>

              {/* Cost per Hire */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body-md text-slate-700 font-medium">Cost per Hire (USD)</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-label-sm font-semibold rounded">
                    {analyticsData.aiVsManual.costPerHire.improvement}% improvement
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="h-16 bg-slate-900 rounded-lg mb-2"></div>
                    <p className="text-label-sm text-slate-600 font-medium">${analyticsData.aiVsManual.costPerHire.ai}k</p>
                    <p className="text-label-sm text-slate-400">RecruitOS AI</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-64 bg-slate-200 rounded-lg mb-2"></div>
                    <p className="text-label-sm text-slate-600 font-medium">${analyticsData.aiVsManual.costPerHire.manual}k</p>
                    <p className="text-label-sm text-slate-400">Legacy Manual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Departmental Velocity Audit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-body-md font-semibold text-primary">Departmental Velocity Audit</h3>
            <button className="text-primary text-label-sm font-semibold hover:underline">View All Departments</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Department</th>
                  <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Active Roles</th>
                  <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Avg Time to Hire</th>
                  <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Matching Quality</th>
                  <th className="text-left px-4 py-3 text-label-sm text-secondary uppercase font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.departments.map((dept, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">domain</span>
                        <span className="text-body-md text-slate-900 font-medium">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-body-md text-slate-700">{dept.roles} Positions</td>
                    <td className="px-4 py-4 text-body-md text-slate-700">{dept.avgTimeToHire}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${dept.quality}%` }}></div>
                        </div>
                        <span className="text-label-sm font-semibold text-slate-700">{dept.quality}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
