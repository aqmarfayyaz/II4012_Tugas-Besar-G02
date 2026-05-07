import React, { useState } from 'react';
import Layout from '../components/Layout';
import { uploadCV, uploadJD, uploadJDText } from '../services/api';

const Upload = () => {
  const [cvFile, setCvFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleCVChange = (e) => setCvFile(e.target.files?.[0] || null);
  const handleJDChange = (e) => setJdFile(e.target.files?.[0] || null);

  const handleUploadCV = async () => {
    if (!cvFile) return setError('Please select a CV file');
    setError('');
    setStatus('Uploading CV...');
    try {
      const res = await uploadCV(cvFile);
      // Standardized success message
      setStatus('cv uploaded succesfully');
      // store last upload summary for dashboard
      if (res.data && res.data.data) {
        localStorage.setItem('last_upload', JSON.stringify(res.data.data));
      }
    } catch (err) {
      setError('CV upload failed');
    }
  };

  const handleUploadJD = async () => {
    if (!jdFile && !jdText) return setError('Please choose a JD file or enter JD text');
    setError('');
    setStatus('Uploading JD...');
    try {
      let res;
      if (jdFile) {
        res = await uploadJD(jdFile);
      } else {
        res = await uploadJDText({ text: jdText });
      }
      // Standardized success message for any upload
      setStatus('cv uploaded succesfully');
      if (res.data && res.data.data) {
        localStorage.setItem('last_upload', JSON.stringify(res.data.data));
      }
    } catch (err) {
      setError('JD upload failed');
    }
  };

  return (
    <Layout title="Upload">
      <div className="max-w-[1000px] mx-auto px-8 py-8">
        <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h2 className="font-h2 text-h2 text-primary mb-2">Upload CV</h2>
          <p className="text-body-md text-secondary mb-6">Supported: PDF, DOCX, DOC, TXT (max 50MB)</p>

          <div className="space-y-4">
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleCVChange} />
            <div className="flex gap-3">
              <button onClick={handleUploadCV} className="px-4 py-2 bg-primary text-white rounded-lg">Upload CV</button>
              <button onClick={() => { setCvFile(null); setStatus(''); setError(''); }} className="px-4 py-2 border rounded-lg">Reset</button>
            </div>
            {status && <div className="text-sm text-green-700">{status}</div>}
            {error && <div className="text-sm text-red-700">{error}</div>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mt-8">
          <h2 className="font-h2 text-h2 text-primary mb-2">Upload Job Description</h2>
          <p className="text-body-md text-secondary mb-6">Paste JD text or upload a file</p>

          <div className="space-y-4">
            <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste job description here..." className="w-full p-4 border rounded-lg h-40" />
            <div className="text-center text-sm text-slate-500 py-2">OR</div>
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleJDChange} />

            <div className="flex gap-3 mt-4">
              <button onClick={handleUploadJD} className="px-4 py-2 bg-primary text-white rounded-lg">Upload JD</button>
              <button onClick={() => { setJdFile(null); setJdText(''); setStatus(''); setError(''); }} className="px-4 py-2 border rounded-lg">Reset</button>
            </div>

            {status && <div className="text-sm text-green-700">{status}</div>}
            {error && <div className="text-sm text-red-700">{error}</div>}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Upload;
