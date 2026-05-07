import React from 'react';

const InsightPanel = ({ candidate }) => {
  if (!candidate) {
    return null;
  }

  const skillDetails = candidate.skill_details || {};

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">📊 Detailed Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score Breakdown */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Score Breakdown</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Match</span>
                <span className="font-bold">{candidate.overall_score}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(candidate.overall_score, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Text Similarity</span>
                <span className="font-bold">{candidate.similarity_score}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(candidate.similarity_score, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Skills Match</span>
                <span className="font-bold">{candidate.skill_score}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min(candidate.skill_score, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Summary */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Skills Analysis</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Required Skills:</span>
              <span className="ml-2">
                {skillDetails.required_matched}/{skillDetails.required_total} matched
              </span>
            </div>
            <div>
              <span className="font-medium">Preferred Skills:</span>
              <span className="ml-2">
                {skillDetails.preferred_matched}/{skillDetails.preferred_total} matched
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      {skillDetails.matched_skills && skillDetails.matched_skills.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">✅ Matched Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skillDetails.matched_skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {skillDetails.missing_skills && skillDetails.missing_skills.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">❌ Missing Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skillDetails.missing_skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      {candidate.insight && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h4 className="font-semibold mb-2">💡 Assessment</h4>
          <p className="text-sm text-gray-700">{candidate.insight}</p>
        </div>
      )}
    </div>
  );
};

export default InsightPanel;
