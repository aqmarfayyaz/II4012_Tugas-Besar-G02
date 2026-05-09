import React from 'react';

const ResultsTable = ({ candidates, onSelectCandidate }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No results yet. Upload CV and JD to start screening.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold">Candidate Rankings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Overall Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Similarity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Skills</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectCandidate(candidate)}
              >
                <td className="px-6 py-4 text-sm font-bold">#{candidate.rank}</td>
                <td className="px-6 py-4 text-sm">{candidate.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(candidate.overall_score, 100)}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm font-semibold">{candidate.overall_score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{candidate.similarity_score}%</td>
                <td className="px-6 py-4 text-sm">{candidate.skill_score}%</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCandidate(candidate);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
