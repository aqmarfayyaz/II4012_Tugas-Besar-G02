import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock database of candidates
  const candidatesDatabase = {
    '1': {
      id: '1',
      initials: 'JD',
      name: 'John Doe',
      title: 'Senior Developer',
      matchScore: 92,
      experience: '8+ Years',
      education: 'MSc Comp Sci',
      university: 'Stanford',
      department: 'Engineering',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      requiredMatched: ['React', 'Node.js', 'Python'],
      missingSkills: ['Kubernetes', 'GraphQL'],
      email: 'john@example.com',
      phone: '+1-234-567-8900',
      status: 'shortlisted',
    },
    '2': {
      id: '2',
      initials: 'JS',
      name: 'Jane Smith',
      title: 'Full Stack Developer',
      matchScore: 85,
      experience: '6+ Years',
      education: 'BSc Computer Science',
      university: 'MIT',
      department: 'Engineering',
      skills: ['Vue.js', 'Django', 'PostgreSQL', 'Docker'],
      requiredMatched: ['Django', 'PostgreSQL'],
      missingSkills: ['React', 'Kubernetes', 'AWS'],
      email: 'jane@example.com',
      phone: '+1-345-678-9012',
      status: 'interviewed',
    },
    '3': {
      id: '3',
      initials: 'MJ',
      name: 'Mike Johnson',
      title: 'Frontend Engineer',
      matchScore: 78,
      experience: '4+ Years',
      education: 'BCS Information Technology',
      university: 'UC Berkeley',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      requiredMatched: ['React', 'TypeScript'],
      missingSkills: ['Node.js', 'Python', 'AWS'],
      email: 'mike@example.com',
      phone: '+1-456-789-0123',
      status: 'applied',
    },
    '4': {
      id: '4',
      initials: 'SB',
      name: 'Sarah Brown',
      title: 'Product Manager',
      matchScore: 88,
      experience: '7+ Years',
      education: 'MBA Business Administration',
      university: 'Harvard',
      department: 'Product',
      skills: ['Product Strategy', 'Analytics', 'Agile', 'Data Analysis'],
      requiredMatched: ['Product Strategy', 'Analytics', 'Agile'],
      missingSkills: ['Technical Writing'],
      email: 'sarah@example.com',
      phone: '+1-567-890-1234',
      status: 'shortlisted',
    },
    '5': {
      id: '5',
      initials: 'DW',
      name: 'David Wilson',
      title: 'UX Designer',
      matchScore: 81,
      experience: '5+ Years',
      education: 'BFA Graphic Design',
      university: 'Rhode Island School of Design',
      department: 'Design',
      skills: ['Figma', 'User Research', 'Prototyping', 'Wireframing'],
      requiredMatched: ['Figma', 'User Research'],
      missingSkills: ['Motion Design'],
      email: 'david@example.com',
      phone: '+1-678-901-2345',
      status: 'interviewed',
    },
  };

  const candidate = candidatesDatabase[id] || candidatesDatabase['1'];

  return (
    <Layout title="Candidate Profile">
      <div className="px-8 py-8 max-w-[1440px] mx-auto space-y-6">
        {/* Breadcrumbs & Actions */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 text-label-sm">
            <button onClick={() => navigate('/candidates')} className="hover:text-primary transition-colors font-semibold">
              Candidates
            </button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 font-semibold">{candidate.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Add Notes
            </button>
            <button className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-red-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">close</span>
              Reject
            </button>
            <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Shortlist
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Profile Card */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full object-cover shadow-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-5xl font-bold">
                  {candidate.initials}
                </div>
              </div>

              <h2 className="text-h2 font-h2 text-slate-900 mb-1">{candidate.name}</h2>
              <p className="text-primary font-semibold mb-4 px-3 py-1 bg-primary/10 rounded-full text-sm">{candidate.title}</p>
              <span className="text-label-sm text-slate-500 mb-6 uppercase tracking-wider font-semibold">{candidate.department}</span>

              {/* Match Score Gauge */}
              <div className="relative w-40 h-40 mb-8">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#091426"
                    strokeWidth="8"
                    strokeDasharray={`${(candidate.matchScore / 100) * (2 * Math.PI * 90)} ${2 * Math.PI * 90}`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-h1 font-h1 text-slate-900">{candidate.matchScore}%</span>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Experience</span>
                  <span className="text-label-sm text-slate-700 font-medium">{candidate.experience}</span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Education</span>
                  <p className="text-label-sm text-slate-700 font-medium">{candidate.education}</p>
                  <p className="text-label-sm text-slate-600">{candidate.university}</p>
                </div>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  {candidate.email}
                </a>
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">phone</span>
                  {candidate.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Analysis */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Skills Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-6">Skills Analysis</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-label-sm text-slate-600 uppercase font-semibold">Required Skills Matched</p>
                  <p className="text-h2 font-h2 text-green-600 mt-2">{candidate.requiredMatched.length} / {candidate.skills.length}</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-label-sm text-slate-600 uppercase font-semibold">Missing Skills</p>
                  <p className="text-h2 font-h2 text-orange-600 mt-2">{candidate.missingSkills.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                    <p className="text-body-md font-semibold text-slate-700">Matched Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.requiredMatched.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-label-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-red-600 text-lg">close</span>
                    <p className="text-body-md font-semibold text-slate-700">Missing Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missingSkills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-label-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-600 text-lg mt-1">lightbulb</span>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Assessment & Recommendation</h4>
                  <p className="text-body-md text-slate-700 leading-relaxed">
                    This candidate demonstrates strong alignment with the role, with {Math.round((candidate.requiredMatched.length / candidate.skills.length) * 100)}% of key skills already matched. 
                    The {candidate.missingSkills.length} missing skill{candidate.missingSkills.length !== 1 ? 's' : ''} can be addressed through targeted training during onboarding.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-body-md font-semibold text-primary mb-6">Key Strengths</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-green-600 text-lg mt-0.5 flex-shrink-0">check_circle</span>
                  <div>
                    <p className="font-semibold text-slate-900">{candidate.experience} Experience</p>
                    <p className="text-label-sm text-slate-600">Extensive background in the field with proven track record</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-green-600 text-lg mt-0.5 flex-shrink-0">check_circle</span>
                  <div>
                    <p className="font-semibold text-slate-900">Diverse Skill Set</p>
                    <p className="text-label-sm text-slate-600">Proficient in {candidate.requiredMatched.length}+ key technologies</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-green-600 text-lg mt-0.5 flex-shrink-0">check_circle</span>
                  <div>
                    <p className="font-semibold text-slate-900">Strong Educational Background</p>
                    <p className="text-label-sm text-slate-600">{candidate.education} from {candidate.university}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CandidateDetail;
