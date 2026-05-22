import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  getHealth,
  uploadCV,
  uploadJDText,
  rankCandidates,
  saveScreeningResults,
} from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const { currentProject } = useAuth();

  const [cvFiles, setCvFiles] = useState([]);
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCandidates, setUploadedCandidates] = useState([]);
  const [jdData, setJdData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Checking backend...');
  const [screeningResult, setScreeningResult] = useState(null);

  const processingStages = [
    { name: 'Upload complete', desc: 'CVs uploaded successfully' },
    { name: 'Parsing CV Metadata', desc: 'Currently analyzing structure...' },
    { name: 'Extracting Skill Data', desc: 'Waiting for parser...' },
    { name: 'Generating Ranking', desc: 'Awaiting data extraction' },
  ];

  useEffect(() => {
    let isMounted = true;
    getHealth()
      .then(() => { if (isMounted) setBackendStatus('Backend connected'); })
      .catch(() => { if (isMounted) setBackendStatus('Backend not reachable'); });
    return () => { isMounted = false; };
  }, []);

  const handleCVChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCvFiles((prev) => [...prev, ...files]);
  };

  const handleUploadCV = async () => {
    if (cvFiles.length === 0) return setError('Please select CV files');
    setError('');
    setStatus('Uploading and parsing CVs...');
    setUploadProgress(45);
    try {
      const uploaded = [];
      for (let file of cvFiles) {
        const res = await uploadCV(file, currentProject?.id || '');
        if (res.data?.data) uploaded.push(res.data.data);
      }
      setUploadedCandidates(uploaded);
      localStorage.setItem('last_uploaded_candidates', JSON.stringify(uploaded));
      setStatus(`${uploaded.length} CV(s) uploaded and parsed`);
      setUploadProgress(100);
      setProcessingStage(1);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'CV upload failed';
      setError(msg);
      setUploadProgress(0);
    }
  };

  const handleUploadJD = async () => {
    if (!jdText) return setError('Please enter job description');
    setError('');
    setStatus('Processing job description...');
    try {
      const res = await uploadJDText({ text: jdText });
      setStatus('Job description processed');
      if (res.data?.data) {
        const jd = res.data.data;
        setJdData(jd);
        localStorage.setItem('last_uploaded_jd', JSON.stringify(jd));
      }
      setProcessingStage(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'JD processing failed');
    }
  };

  const handleRunScreening = async () => {
    if (!uploadedCandidates.length) return setError('Please upload CV files first');
    if (!jdData) return setError('Please submit job description first');
    setError('');
    setStatus('Running AI screening pipeline...');
    setProcessingStage(3);
    setScreeningResult(null);
    try {
      const res = await rankCandidates(uploadedCandidates, jdData);
      const resultData = res.data?.data;
      if (resultData) {
        localStorage.setItem('ranked_candidates', JSON.stringify(resultData));
        setScreeningResult(resultData);
        // Auto-save to Firestore
        try {
          await saveScreeningResults({
            project_id: currentProject?.id || '',
            ...resultData,
            jd_data: jdData,
          });
        } catch (_) { /* non-critical */ }
      }
      setUploadProgress(100);
      setProcessingStage(4);
      setStatus('Screening completed — results ready');
    } catch (err) {
      setError(err?.response?.data?.message || 'Screening failed');
      setProcessingStage(2);
    }
  };

  const handleReset = () => {
    setCvFiles([]);
    setJdText('');
    setStatus('');
    setError('');
    setProcessingStage(0);
    setUploadProgress(0);
    setUploadedCandidates([]);
    setJdData(null);
    setScreeningResult(null);
    localStorage.removeItem('last_uploaded_candidates');
    localStorage.removeItem('last_uploaded_jd');
    localStorage.removeItem('ranked_candidates');
  };

  const scoreColor = (score) => {
    if (score >= 70) return 'text-green-700';
    if (score >= 50) return 'text-yellow-700';
    return 'text-red-600';
  };

  const scoreBg = (score) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const badgeLabel = (score) => {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 65) return 'Strong Match';
    if (score >= 45) return 'Moderate Match';
    return 'Low Match';
  };

  return (
    <Layout title="Upload">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-h1 text-primary">Upload CV & Screening Data</h1>
          <p className="text-body-md text-secondary mt-1">Upload candidate files for automated AI extraction and score mapping</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-label-sm text-slate-500">{backendStatus}</p>
            {currentProject && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-label-sm font-semibold rounded">
                Project: {currentProject.name}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Upload Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Upload CV Files</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.rtf"
                  onChange={handleCVChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">description</span>
                <h4 className="text-body-md font-semibold text-slate-900 mb-1">Click or drag files to upload</h4>
                <p className="text-label-sm text-slate-500">PDF, DOCX, RTF (Max 25MB)</p>
              </div>

              {cvFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-label-sm font-semibold text-slate-700">{cvFiles.length} file(s) selected:</p>
                  {cvFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">check_circle</span>
                        <span className="text-label-sm text-slate-700">{file.name}</span>
                      </div>
                      <span className="text-label-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Parsed CV preview */}
              {uploadedCandidates.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-label-sm font-bold text-slate-700 uppercase tracking-wider">Parsed Results</p>
                  {uploadedCandidates.map((c, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm font-semibold text-slate-900">{c.candidate_name || 'Unknown'}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          c.predicted_label === 'TECH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          c.predicted_label === 'BUSINESS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {c.predicted_label || 'Unknown'} · {((c.prediction_confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      {c.email && <p className="text-[11px] text-slate-500">{c.email}</p>}
                      {c.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.skills.slice(0, 6).map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-600 rounded">{s}</span>
                          ))}
                          {c.skills.length > 6 && <span className="text-[10px] text-slate-400">+{c.skills.length - 6} more</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button onClick={handleUploadCV} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                  Upload & Parse CVs
                </button>
              </div>
            </div>

            {/* JD Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">Job Description Requirement</h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none text-label-sm"
              />
              {jdData && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-label-sm font-semibold text-green-800">JD Processed</p>
                  <p className="text-[11px] text-green-700 mt-0.5">
                    {jdData.job_title} · Category: {jdData.job_category || 'N/A'} ·
                    Required skills: {jdData.required_skills?.join(', ') || 'none detected'}
                  </p>
                </div>
              )}
              <div className="flex justify-end mt-3">
                <button onClick={handleUploadJD} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                  Submit Job Description
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reset
              </button>
              <button
                onClick={handleRunScreening}
                disabled={uploadedCandidates.length === 0 || !jdData}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Run AI Screening
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-label-sm">
                {error}
              </div>
            )}
            {status && !screeningResult && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-label-sm">
                {status}
              </div>
            )}

            {/* ── SCREENING RESULTS PANEL ── */}
            {screeningResult && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">AI Screening Results</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {screeningResult.total_candidates} candidate(s) · Job category: {screeningResult.job_category || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/ranking', { state: { results: screeningResult, jdData } })}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_full</span>
                    Full Ranking
                  </button>
                </div>

                {/* Ranked Cards */}
                <div className="divide-y divide-slate-100">
                  {(screeningResult.ranked_candidates || []).map((candidate, idx) => {
                    const score = Math.round(candidate.overall_score || 0);
                    return (
                      <div key={idx} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          {/* Rank + Name */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              #{candidate.rank}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{candidate.name || 'Candidate'}</p>
                              <p className="text-xs text-slate-500">{candidate.email}</p>
                              {candidate.predicted_category && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded">
                                  {candidate.predicted_category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Score */}
                          <div className={`flex-shrink-0 text-right px-3 py-2 rounded-lg border ${scoreBg(score)}`}>
                            <p className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</p>
                            <p className={`text-[10px] font-bold uppercase ${scoreColor(score)}`}>{badgeLabel(score)}</p>
                          </div>
                        </div>

                        {/* Score breakdown */}
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Overall</p>
                            <p className="text-sm font-bold text-slate-900">{score}%</p>
                          </div>
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Semantic</p>
                            <p className="text-sm font-bold text-slate-900">{Math.round(candidate.similarity_score || 0)}%</p>
                          </div>
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Skill Match</p>
                            <p className="text-sm font-bold text-slate-900">{Math.round(candidate.skill_score || 0)}%</p>
                          </div>
                        </div>

                        {/* Skill details */}
                        {candidate.skill_details && (
                          <div className="mt-3 space-y-1">
                            {candidate.skill_details.matched_skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-green-700 uppercase w-14 flex-shrink-0">Matched</span>
                                {candidate.skill_details.matched_skills.map((s, si) => (
                                  <span key={si} className="px-1.5 py-0.5 bg-green-50 border border-green-200 text-[10px] text-green-700 rounded">{s}</span>
                                ))}
                              </div>
                            )}
                            {candidate.skill_details.missing_skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-red-600 uppercase w-14 flex-shrink-0">Missing</span>
                                {candidate.skill_details.missing_skills.map((s, si) => (
                                  <span key={si} className="px-1.5 py-0.5 bg-red-50 border border-red-200 text-[10px] text-red-600 rounded">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Insight */}
                        {candidate.insight && (
                          <p className="mt-2 text-xs text-slate-600 italic border-l-2 border-slate-300 pl-3">
                            {candidate.insight}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Screening Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-body-md font-semibold text-primary">Screening Status</h3>
                <span className={`px-2 py-1 text-label-sm font-bold rounded ${processingStage === 4 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {processingStage === 4 ? 'DONE' : 'ACTIVE'}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-label-sm font-semibold text-slate-700">Processing Pipeline</p>
                    <span className="text-label-sm font-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                {processingStages.map((stage, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${processingStage > idx ? 'opacity-100' : 'opacity-40'}`}>
                    <span className={`material-symbols-outlined text-lg flex-shrink-0 ${processingStage > idx ? 'text-green-600' : 'text-slate-300'}`}>
                      {processingStage > idx ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900">{stage.name}</p>
                      <p className="text-label-sm text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl flex-shrink-0">lightbulb</span>
                <div>
                  <h4 className="font-semibold mb-2">Pro Tip</h4>
                  <p className="text-label-sm leading-relaxed">
                    For better results, include specific technical keywords and experience requirements in the job description.
                    Our AI matches these against candidate semantic profiles.
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

export default Upload;
