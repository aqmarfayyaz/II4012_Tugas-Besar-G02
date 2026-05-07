import React, { useState } from 'react';
import Layout from '../components/Layout';

const Ranking = () => {
  const [rankedCandidates] = useState([
    { rank: 1, name: 'John Doe', score: 92, matchType: 'Excellent Match', decision: 'Accept' },
    { rank: 2, name: 'Jane Smith', score: 85, matchType: 'Good Match', decision: 'Interview' },
    { rank: 3, name: 'Mike Johnson', score: 78, matchType: 'Acceptable Match', decision: 'Maybe' },
  ]);

  return (
    <Layout title="Ranking">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <header className="mb-8">
          <h2 className="font-h2 text-h2 text-primary">Candidate Ranking</h2>
          <p className="font-body-md text-body-md text-secondary mt-2">
            Ranked candidates sorted by AI screening score
          </p>
        </header>

        {/* Rankings List */}
        <div className="space-y-4">
          {rankedCandidates.map((candidate) => (
            <div
              key={candidate.rank}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">#{candidate.rank}</span>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1">
                  <h3 className="font-h3 text-h3 text-primary">{candidate.name}</h3>
                  <p className="text-body-md text-secondary mt-1">{candidate.matchType}</p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-primary">{candidate.score}%</div>
                  <p className="text-label-sm text-secondary uppercase">Match Score</p>
                </div>

                {/* Decision */}
                <div className="flex-shrink-0">
                  <button
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      candidate.decision === 'Accept'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : candidate.decision === 'Interview'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {candidate.decision}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Ranking;
