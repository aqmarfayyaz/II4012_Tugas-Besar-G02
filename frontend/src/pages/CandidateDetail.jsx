import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCandidate, updateCandidateStatus } from '../services/api';

const STATUS_OPTIONS = ['applied', 'review', 'shortlisted', 'interviewed', 'rejected'];

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getCandidate(id);
        const payload = response.data?.data || response.data;
        setCandidate(payload.data || payload);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load candidate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const initialsFor = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const handleStatusChange = async (nextStatus) => {
    if (!candidate) return;
    setStatusUpdating(true);
    try {
      await updateCandidateStatus(candidate.id, nextStatus);
      setCandidate((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Candidate Profile">
        <div className="px-8 py-8 max-w-[1440px] mx-auto text-slate-500">Loading candidate...</div>
      </Layout>
    );
  }

  if (error || !candidate) {
    return (
      <Layout title="Candidate Profile">
        <div className="px-8 py-8 max-w-[1440px] mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error || 'Candidate not found.'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Candidate Profile">
      <div className="px-8 py-8 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 text-label-sm">
            <button onClick={() => navigate('/candidates')} className="hover:text-primary transition-colors font-semibold">
              Candidates
            </button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 font-semibold">{candidate.name || 'Candidate'}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={candidate.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full object-cover shadow-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-5xl font-bold">
                  {initialsFor(candidate.name)}
                </div>
              </div>

              <h2 className="text-h2 font-h2 text-slate-900 mb-1">{candidate.name || 'Candidate'}</h2>
              <p className="text-primary font-semibold mb-4 px-3 py-1 bg-primary/10 rounded-full text-sm">
                {candidate.applied_position || 'Role not set'}
              </p>
              <span className="text-label-sm text-slate-500 mb-6 uppercase tracking-wider font-semibold">
                {candidate.department || 'Department'}
              </span>

              <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Match Score</span>
                  <div className="w-full">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(candidate.match_score || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-label-sm text-slate-700 font-medium mt-2 inline-block">
                      {candidate.match_score ? `${Math.round(candidate.match_score)}%` : '--'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Recommendation</span>
                  <span className="text-label-sm text-slate-700 font-medium">
                    {candidate.recommendation || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3">
                {candidate.email && (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    {candidate.email}
                  </a>
                )}
                {candidate.cv_download_url && (
                  <a
                    href={candidate.cv_download_url}
                    className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Download CV
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Summary</h3>
              <p className="text-body-md text-slate-700 leading-relaxed">
                {candidate.summary || candidate.experience_text || 'No summary available.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Skills Extracted</h3>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills || []).length > 0 ? (
                  candidate.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-label-sm font-semibold">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">No skills extracted.</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Experience Summary</h3>
              <p className="text-body-md text-slate-700 leading-relaxed">
                {candidate.experience_text || 'No experience summary available.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Education</h3>
              <p className="text-body-md text-slate-700 leading-relaxed">
                {candidate.education_text || 'No education data available.'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Screening Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-label-sm text-secondary uppercase font-semibold">Matched Skills</p>
                  <p className="text-h2 font-h2 text-primary mt-1">
                    {candidate.skill_details?.required_matched || 0}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-label-sm text-secondary uppercase font-semibold">Missing Skills</p>
                  <p className="text-h2 font-h2 text-primary mt-1">
                    {candidate.skill_details?.missing_skills?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CandidateDetail;