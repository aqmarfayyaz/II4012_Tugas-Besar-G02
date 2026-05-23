import React, { useState } from 'react';
import Layout from '../components/Layout';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: 'David',
    lastName: 'Henderson',
    jobTitle: 'HR Operations Director',
    department: 'Enterprise Human Resources',
    email: 'd.henderson@talentpulse.ai',
    location: 'London HQ, United Kingdom',
    bio: 'Spearheading AI-driven recruitment strategies for global operations. Focused on ethical automation and data-informed workforce management.'
  });

  const [isEditing, setIsEditing] = useState(false);

  const departments = [
    'Enterprise Human Resources',
    'Recruiting',
    'Operations',
    'Finance',
    'Engineering',
    'Product'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout title="Profile">
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-start gap-8">

            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                DH
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-lg hover:opacity-90 transition-all shadow-md">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>edit</span>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{formData.firstName} {formData.lastName}</h1>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">Administrator</span>
              </div>
              <p className="text-base font-medium text-primary mb-1">{formData.jobTitle}</p>
              <p className="text-sm text-slate-600 mb-4">{formData.bio}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="material-symbols-outlined text-base">domain</span>
                  <span>{formData.department}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span>{formData.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span>{formData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">

          <div className="col-span-2">

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Update Details
                </button>
              </div>

              <div className="space-y-6">

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-label-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-label-sm font-semibold text-slate-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-slate-700 mb-2">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      disabled
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-slate-700 mb-2">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    rows="4"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-6 border-b border-slate-200">Security & Authentication</h2>

              <div className="space-y-4">

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-700" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Enabled via Authenticator App</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-primary font-semibold text-sm hover:underline">Manage</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-yellow-700">lock</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Password Policy</p>
                      <p className="text-xs text-slate-500">Last updated 14 days ago</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-primary font-semibold text-sm hover:underline">Update</button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1">

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-200">Recent Activity</h3>

              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Profile Updated</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Login</p>
                  <p className="text-xs text-slate-500 mt-1">Today at 8:34 AM</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Settings Changed</p>
                  <p className="text-xs text-slate-500 mt-1">Yesterday at 4:12 PM</p>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                View Full Activity Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
