import React from 'react';
import Layout from '../components/Layout';

const Notifications = () => {
  const notifications = [
    // Placeholder items - will populate from backend
  ];

  return (
    <Layout title="Notifications">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-slate-300">notifications_none</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                You have no new notifications. We'll let you know when something important happens.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    notif.type === 'success'
                      ? 'border-l-green-500 bg-green-50'
                      : notif.type === 'error'
                      ? 'border-l-red-500 bg-red-50'
                      : 'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-lg mt-0.5">
                      {notif.type === 'success' ? 'check_circle' : notif.type === 'error' ? 'error' : 'info'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{notif.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{notif.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
