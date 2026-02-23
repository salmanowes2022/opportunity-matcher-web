import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { getScoreColor, formatScore } from '../../utils/scoreHelpers';

export default function CompatibilityGauge({ score }) {
  const colors = getScoreColor(score);
  const data = [{ value: score * 100, fill: colors.hex }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f3f4f6' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{formatScore(score)}</span>
          <span className="text-xs text-gray-500">match</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-semibold ${colors.text}`}>{colors.label}</span>
    </div>
  );
}
