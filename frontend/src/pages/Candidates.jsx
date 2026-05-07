import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Candidates = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  const [candidates] = useState([
    {
      id: '1',
      initials: 'JD',
      name: 'John Doe',
      email: 'john@example.com',
      position: 'Senior Developer',
      department: 'Engineering',
      matchScore: 92,
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      status: 'shortlisted',
      uploadDate: '2026-05-05',
    },
    {
      id: '2',
      initials: 'JS',
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: 'Full Stack Developer',
      department: 'Engineering',
      matchScore: 85,
      skills: ['Vue.js', 'Django', 'PostgreSQL', 'Docker'],
      status: 'interviewed',
      uploadDate: '2026-05-04',
    },
    {
      id: '3',
      initials: 'MJ',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      position: 'Frontend Engineer',
      department: 'Engineering',
      matchScore: 78,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      status: 'applied',
      uploadDate: '2026-05-03',
    },
    {
      id: '4',
      initials: 'SB',
      name: 'Sarah Brown',
      email: 'sarah@example.com',
      position: 'Product Manager',
      department: 'Product',
      matchScore: 88,
      skills: ['Product Strategy', 'Analytics', 'Agile'],
      status: 'shortlisted',
      uploadDate: '2026-05-02',
    },
    {
      id: '5',
      initials: 'DW',
      name: 'David Wilson',
      email: 'david@example.com',
      position: 'UX Designer',
      department: 'Design',
      matchScore: 81,
      skills: ['Figma', 'User Research', 'Prototyping'],
      status: 'interviewed',
      uploadDate: '2026-05-01',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return { bg: 'bg-green-50', text: 'text-green-700', icon: 'check_circle', border: 'border-green-200' };
      case 'interviewed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'person', border: 'border-blue-200' };
      case 'rejected':
        return { bg: 'bg-red-50', text: 'text-red-700', icon: 'close', border: 'border-red-200' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'mail', border: 'border-slate-200' };
    }
  };

  const getScoreCategory = (score) => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && candidate.matchScore >= 85) ||
      (scoreFilter === 'medium' && candidate.matchScore >= 70 && candidate.matchScore < 85) ||
      (scoreFilter === 'low' && candidate.matchScore < 70);

    return matchesSearch && matchesStatus && matchesScore;
  });

  return (
    <Layout title="Candidates">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Candidate Pool</h1>
            <p className="text-body-md text-secondary mt-1">Manage and evaluate all candidates across your recruitment pipeline</p>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Candidate
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-secondary text-xl">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-secondary font-semibold">Status:</span>
              {['all', 'applied', 'shortlisted', 'interviewed', 'rejected'].map((status) => (
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

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-label-sm text-secondary font-semibold">Match Score:</span>
              {['all', 'high', 'medium', 'low'].map((score) => (
                <button
                  key={score}
                  onClick={() => setScoreFilter(score)}
                  className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
                    scoreFilter === score
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score === 'all' ? 'All' : score === 'high' ? '85+' : score === 'medium' ? '70-84' : '<70'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Candidate</th>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Position</th>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Match Score</th>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-label-sm text-secondary uppercase font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => {
                  const statusColor = getStatusColor(candidate.status);
                  return (
                    <tr
                      key={candidate.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      {/* Candidate Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-label-sm font-bold">
                            {candidate.initials}
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-slate-900">{candidate.name}</p>
                            <p className="text-label-sm text-slate-500">{candidate.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        <p className="text-body-md text-slate-700 font-medium">{candidate.position}</p>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="text-body-md text-slate-600">{candidate.department}</span>
                      </td>

                      {/* Match Score */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  getScoreCategory(candidate.matchScore) === 'high'
                                    ? 'bg-green-500'
                                    : getScoreCategory(candidate.matchScore) === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-orange-500'
                                }`}
                                style={{ width: `${candidate.matchScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-label-sm font-bold text-slate-900 w-10 text-right">
                            {candidate.matchScore}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                          <span className="material-symbols-outlined text-sm">{statusColor.icon}</span>
                          <span className="text-label-sm font-semibold">
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/candidate/${candidate.id}`)}
                          className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors flex items-center gap-1"
                        >
                          <span>View Profile</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 inline-block">
                      person_off
                    </span>
                    <p className="text-body-md text-slate-600 mt-3">No candidates found matching your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Skills Overview */}
        {filteredCandidates.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">Top Skills in Filtered Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['React', 'Python', 'AWS', 'TypeScript'].map((skill, idx) => {
                const skillCount = filteredCandidates.filter((c) =>
                  c.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
                ).length;
                return (
                  <div key={skill} className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-label-sm text-secondary uppercase font-semibold">{skill}</p>
                    <p className="text-h2 font-h2 text-primary mt-1">{skillCount}</p>
                    <p className="text-label-sm text-slate-600 mt-1">
                      {Math.round((skillCount / filteredCandidates.length) * 100)}% of results
                    </p>
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

export default Candidates;
