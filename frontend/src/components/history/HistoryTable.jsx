import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { getScoreColor, formatScore, formatDate } from '../../utils/scoreHelpers';

function getBadgeVariant(score) {
  if (score >= 0.7) return 'green';
  if (score >= 0.5) return 'amber';
  return 'red';
}

export default function HistoryTable({ items, onDelete }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Opportunity</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Score</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => {
            const score = Number(item.compatibility_score);
            return (
              <React.Fragment key={item.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{item.opportunity_title}</td>
                  <td className="px-4 py-3 text-gray-500">{item.opportunity_type}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={getBadgeVariant(score)}>{formatScore(score)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(item.evaluated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {expanded === item.id && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-gray-50">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <strong className="text-green-800 block mb-1">✅ Strengths</strong>
                          <p className="text-green-700">{item.strengths}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <strong className="text-amber-800 block mb-1">⚠️ Gaps</strong>
                          <p className="text-amber-700">{item.gaps}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <strong className="text-blue-800 block mb-1">💡 Recommendation</strong>
                          <p className="text-blue-700">{item.recommendation}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
