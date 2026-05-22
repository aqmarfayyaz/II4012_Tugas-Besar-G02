import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProjectCandidates, updateCandidateStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['applied', 'review', 'shortlisted', 'interviewed', 'rejected'];

const Candidates = () => {
  const navigate = useNavigate();
  const { currentProject } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced, statusFilter, scoreFilter]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!currentProject?.id) {
        setCandidates([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const params = { page, page_size: pageSize };
        if (searchDebounced) params.search = searchDebounced;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (scoreFilter === 'high') params.min_score = 85;
        if (scoreFilter === 'medium') {
          params.min_score = 70;
          params.max_score = 84.99;
        }
        if (scoreFilter === 'low') params.max_score = 69.99;

        const response = await getProjectCandidates(currentProject.id, params);
        const payload = response.data?.data || response.data;
        const list = payload.candidates || payload.data?.candidates || [];
        setCandidates(list);
        setTotal(payload.total || payload.data?.total || list.length);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load candidates.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [currentProject, page, pageSize, searchDebounced, statusFilter, scoreFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return { bg: 'bg-green-50', text: 'text-green-700', icon: 'check_circle', border: 'border-green-200' };
      case 'interviewed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'person', border: 'border-blue-200' };
      case 'rejected':
        return { bg: 'bg-red-50', text: 'text-red-700', icon: 'close', border: 'border-red-200' };
      case 'review':
        return { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'schedule', border: 'border-amber-200' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'mail', border: 'border-slate-200' };
    }
  };

  const getScoreCategory = (score) => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const initialsFor = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const topSkills = useMemo(() => {
    const counts = new Map();
    candidates.forEach((candidate) => {
      (candidate.skills || []).forEach((skill) => {
        const key = skill.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([skill, count]) => ({ skill, count }));
  }, [candidates]);

  const handleStatusChange = async (candidateId, nextStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [candidateId]: true }));
    try {
      await updateCandidateStatus(candidateId, nextStatus);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, status: nextStatus } : candidate
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  return (
    <Layout title="Candidates">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-primary">Candidate Pool</h1>
            <p className="text-body-md text-secondary mt-1">
              Manage and evaluate candidates from AI screening for {currentProject?.name || 'your project'}
            </p>
          </div>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            onClick={() => navigate('/upload')}
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            Upload CV
          </button>
        </div>

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

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-secondary font-semibold">Status:</span>
              {['all', ...STATUS_OPTIONS].map((status) => (
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => {
                  const statusColor = getStatusColor(candidate.status);
                  return (
                    <tr
                      key={candidate.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-label-sm font-bold">
                            {initialsFor(candidate.name)}
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-slate-900">{candidate.name || 'Unnamed'}</p>
                            <p className="text-label-sm text-slate-500">{candidate.email || '-'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-body-md text-slate-700 font-medium">{candidate.applied_position || '-'}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-body-md text-slate-600">{candidate.department || '-'}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  getScoreCategory(candidate.match_score) === 'high'
                                    ? 'bg-green-500'
                                    : getScoreCategory(candidate.match_score) === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-orange-500'
                                }`}
                                style={{ width: `${Math.min(candidate.match_score || 0, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-label-sm font-bold text-slate-900 w-12 text-right">
                            {candidate.match_score ? `${Math.round(candidate.match_score)}%` : '--'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                          <span className="material-symbols-outlined text-sm">{statusColor.icon}</span>
                          <span className="text-label-sm font-semibold">
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <select
                            value={candidate.status}
                            disabled={statusUpdating[candidate.id]}
                            onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                            className="border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 bg-white"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

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
                    <p className="text-body-md text-slate-600 mt-3">No candidates found for these filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {candidates.length} of {total} candidates
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-primary mb-4">Top Skills in Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topSkills.map((item) => (
                <div key={item.skill} className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-label-sm text-secondary uppercase font-semibold">{item.skill}</p>
                  <p className="text-h2 font-h2 text-primary mt-1">{item.count}</p>
                  <p className="text-label-sm text-slate-600 mt-1">
                    {Math.round((item.count / Math.max(candidates.length, 1)) * 100)}% of results
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Candidates;