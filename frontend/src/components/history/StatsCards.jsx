import React from 'react';
import { formatScore } from '../../utils/scoreHelpers';

export default function StatsCards({ stats }) {
  if (!stats) return null;
  const items = [
    { label: 'Total Evaluations', value: stats.total },
    { label: 'Average Score', value: formatScore(stats.avg_score) },
    { label: 'Best Match', value: formatScore(stats.best_match) },
    { label: 'Materials Generated', value: stats.materials_generated },
  ];
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {items.map(s => (
        <div key={s.label} className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{s.value}</div>
          <div className="text-xs text-gray-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
