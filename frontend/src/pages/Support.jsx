import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const FAQ = [
  {
    q: 'How do I start screening candidates?',
    a: 'Create or select a project, then go to Upload to add CVs. Once uploaded, navigate to Ranking and run the AI screening against a Job Description.',
  },
  {
    q: 'What file formats are supported for CV upload?',
    a: 'PDF and TXT files are supported. For best results, use PDF files with selectable (not scanned) text.',
  },
  {
    q: 'What does the match score represent?',
    a: 'The match score (0–100%) is computed by combining semantic similarity between the CV and the JD with a skill overlap analysis. Scores ≥80% are flagged as "Highly Recommended".',
  },
  {
    q: 'Can I manage multiple recruitment projects?',
    a: 'Yes. Use the Projects page to create separate projects for each open role. Each project has its own candidates, screenings, and analytics.',
  },
  {
    q: 'How do I export analytics data?',
    a: 'Go to the Analytics page and click "Export CSV". The download includes a summary, full candidate table, project list, and screening session details.',
  },
  {
    q: 'Why is a candidate showing a 0% match score?',
    a: "The candidate has been uploaded but not yet run through AI screening. Go to Ranking, select the project's JD, and run the screen.",
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <span className={`material-symbols-outlined text-slate-400 text-base flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && <p className="text-sm text-slate-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
};

const Support = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Support">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">

        <div>
          <h1 className="text-h1 font-h1 text-primary">Help &amp; Support</h1>
          <p className="text-body-md text-secondary mt-1">
            Find answers to common questions or get in touch with the team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'upload_file', label: 'Upload CVs', path: '/upload', desc: 'Add candidate CVs to a project' },
            { icon: 'smart_toy',   label: 'Run Screening', path: '/ranking', desc: 'Start AI ranking against a JD' },
            { icon: 'insights',    label: 'View Analytics', path: '/analytics', desc: 'Explore recruitment metrics' },
          ].map(({ icon, label, path, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-primary hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-primary text-2xl mb-3 block">{icon}</span>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-body-md font-semibold text-primary mb-2">Frequently Asked Questions</h3>
          <div>
            {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-body-md font-semibold text-primary mb-4">Contact Support</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@talentpulse.ai"
              className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700"
            >
              <span className="material-symbols-outlined text-primary">mail</span>
              support@talentpulse.ai
            </a>
            <a
              href="https://github.com/aqmarfayyaz/II4012_Tugas-Besar-G02/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700"
            >
              <span className="material-symbols-outlined text-primary">bug_report</span>
              Report an issue on GitHub
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Support;
