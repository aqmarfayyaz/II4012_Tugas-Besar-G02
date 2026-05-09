import React from 'react';
import Layout from '../components/Layout';

const History = () => {
  const historyItems = [
    // Placeholder items - will populate from backend
  ];

  return (
    <Layout title="History">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          {historyItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-slate-300">history</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No history yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Your screening and upload activities will appear here. Start by uploading a CV or job description.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyItems.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{item.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;
