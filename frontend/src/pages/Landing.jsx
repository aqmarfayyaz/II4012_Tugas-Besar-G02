import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to TalentPulse</h2>
        <p className="text-sm text-slate-600 mb-6">Lightweight CV screening and candidate management.</p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-4 py-2 bg-primary text-white rounded">Create account</Link>
          <Link to="/login" className="px-4 py-2 border border-slate-200 rounded">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
