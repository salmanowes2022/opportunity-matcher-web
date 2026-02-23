import React from 'react';
import { getScoreColor } from '../../utils/scoreHelpers';
import CompatibilityGauge from './CompatibilityGauge';

export default function MatchResultCard({ result, opportunityTitle }) {
  const colors = getScoreColor(result.compatibility_score);

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-start gap-6">
        <CompatibilityGauge score={result.compatibility_score} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{opportunityTitle}</h3>
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
            {colors.label}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Strengths</h4>
          <p className="text-sm text-green-700">{result.strengths}</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Gaps</h4>
          <p className="text-sm text-amber-700">{result.gaps}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Recommendation</h4>
          <p className="text-sm text-blue-700">{result.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
