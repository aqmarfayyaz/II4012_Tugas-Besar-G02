import React, { useState } from 'react';
import Layout from '../components/Layout';
import { uploadCV, uploadJD, uploadJDText } from '../services/api';

const Upload = () => {
  const [cvFiles, setCvFiles] = useState([]);
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processingStages = [
    { name: 'Upload complete', desc: '12 CVs uploaded successfully' },
    { name: 'Parsing CV Metadata', desc: 'Currently analyzing structure...' },
    { name: 'Extracting Skill Data', desc: 'Waiting for parser...' },
    { name: 'Generating Ranking', desc: 'Awaiting data extraction' },
  ];

  const handleCVChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCvFiles((prev) => [...prev, ...files]);
  };

  const handleUploadCV = async () => {
    if (cvFiles.length === 0) return setError('Please select CV files');
    setError('');
    setStatus('Uploading CVs...');
    setUploadProgress(45);
    try {
      for (let file of cvFiles) {
        const res = await uploadCV(file);
        if (res.data && res.data.data) {
          localStorage.setItem('last_upload', JSON.stringify(res.data.data));
        }
      }
      setStatus('CVs uploaded successfully');
      setUploadProgress(100);
      setProcessingStage(1);
    } catch (err) {
      setError('CV upload failed');
      setUploadProgress(0);
    }
  };

  const handleUploadJD = async () => {
    if (!jdText) return setError('Please enter job description');
    setError('');
    setStatus('Processing JD...');
    try {
      const res = await uploadJDText({ text: jdText });
      setStatus('Job description processed successfully');
      if (res.data && res.data.data) {
        localStorage.setItem('last_upload', JSON.stringify(res.data.data));
      }
    } catch (err) {
      setError('JD processing failed');
    }
  };

  const handleRunScreening = () => {
    setProcessingStage(1);
    setTimeout(() => setProcessingStage(2), 2000);
    setTimeout(() => setProcessingStage(3), 4000);
    setTimeout(() => setProcessingStage(4), 6000);
  };

  const handleReset = () => {
    setCvFiles([]);
    setJdText('');
    setStatus('');
    setError('');
    setProcessingStage(0);
    setUploadProgress(0);
  };

  return (
    <Layout title="Upload">
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-h1 text-primary">Upload CV & Screening Data</h1>
          <p className="text-body-md text-secondary mt-1">Upload candidate files for automated AI extraction and score mapping</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload Section */}
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
                <div>
                  <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">description</span>
                  <h4 className="text-body-md font-semibold text-slate-900 mb-1">Click or drag files to upload</h4>
                  <p className="text-label-sm text-slate-500">Support for PDF, DOCX, and RTF (Max 25MB per file)</p>
                </div>
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
            </div>

            {/* Job Description Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-4">JOB DESCRIPTION REQUIREMENT</h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none text-label-sm"
              />
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
                disabled={cvFiles.length === 0 || !jdText}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Run AI Screening
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-label-sm">
                ⚠️ {error}
              </div>
            )}
            {status && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-label-sm">
                ✓ {status}
              </div>
            )}
          </div>

          {/* Right Column - Screening Status */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-body-md font-semibold text-primary">Screening Status</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-label-sm font-bold rounded">ACTIVE JOB</span>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-label-sm font-semibold text-slate-700">Processing Pipeline</p>
                    <span className="text-label-sm font-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Processing Stages */}
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                {processingStages.map((stage, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${processingStage > idx ? 'opacity-100' : 'opacity-50'}`}>
                    <span className={`material-symbols-outlined text-lg flex-shrink-0 ${processingStage > idx ? 'text-green-600' : 'text-slate-300'}`}>
                      {processingStage > idx ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-sm font-semibold text-slate-900">{stage.name}</p>
                      <p className="text-label-sm text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-slate-900 rounded-xl p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl flex-shrink-0">lightbulb</span>
                <div>
                  <h4 className="font-semibold mb-2">Pro Tip</h4>
                  <p className="text-label-sm leading-relaxed">
                    For better results, ensure the job description includes specific technical keywords and experience ranges. Our AI matches these against candidate semantic profiles.
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
