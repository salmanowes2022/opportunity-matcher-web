import React, { useState } from 'react';
import { getScoreColor } from '../../utils/scoreHelpers';
import CompatibilityGauge from './CompatibilityGauge';
import { useNavigate } from 'react-router-dom';

// Parse text into bullet points
function parseBullets(text) {
  if (!text) return [];
  return text
    .split(/[\n;]|(?:^|\s)-\s/)
    .map(s => s.replace(/^[-•·*]\s*/, '').trim())
    .filter(s => s.length > 5);
}

// Infer dimension scores from strengths/gaps text
function inferDimensions(result) {
  const score = result.compatibility_score;
  const dims = [
    { label: 'Education',    keywords: ['education', 'degree', 'bachelor', 'master', 'phd', 'gpa', 'academic'] },
    { label: 'Skills',       keywords: ['skill', 'technical', 'programming', 'language', 'tool', 'framework'] },
    { label: 'Experience',   keywords: ['experience', 'work', 'years', 'internship', 'project', 'professional'] },
    { label: 'Achievements', keywords: ['achievement', 'award', 'honor', 'publication', 'research', 'leadership'] },
  ];
  return dims.map(dim => {
    const inStrengths = dim.keywords.some(k => result.strengths?.toLowerCase().includes(k));
    const inGaps      = dim.keywords.some(k => result.gaps?.toLowerCase().includes(k));
    let adjusted = score;
    if (inStrengths && !inGaps) adjusted = Math.min(1, score + 0.15);
    if (inGaps && !inStrengths) adjusted = Math.max(0, score - 0.2);
    return { label: dim.label, score: adjusted };
  });
}

function DimensionBar({ label, score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-bold ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const TABS = ['Overview', 'Strengths', 'Gaps', 'Action'];

export default function MatchResultCard({ result, opportunityTitle }) {
  const [tab, setTab] = useState('Overview');
  const colors = getScoreColor(result.compatibility_score);
  const navigate = useNavigate();
  const dimensions = inferDimensions(result);
  const strengthBullets = parseBullets(result.strengths);
  const gapBullets = parseBullets(result.gaps);
  const recBullets = parseBullets(result.recommendation);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-start gap-5">
          <CompatibilityGauge score={result.compatibility_score} />
          <div className="flex-1 min-w-0 pt-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Match Result</p>
            <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{opportunityTitle}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              {colors.label}
            </span>
          </div>
        </div>

        {/* Dimension score bars */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
          {dimensions.map(d => <DimensionBar key={d.label} label={d.label} score={d.score} />)}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-3 px-1 mr-5 text-xs font-semibold border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === 'Overview' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 border border-green-100 p-4">
              <p className="text-xs font-semibold text-green-700 mb-2">✅ Top Strength</p>
              <p className="text-sm text-green-800">{strengthBullets[0] || result.strengths}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">⚠️ Main Gap</p>
              <p className="text-sm text-amber-800">{gapBullets[0] || result.gaps}</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">💡 Recommendation</p>
              <p className="text-sm text-blue-800">{recBullets[0] || result.recommendation}</p>
            </div>
          </div>
        )}

        {tab === 'Strengths' && (
          <div>
            <p className="text-xs text-gray-400 mb-3">What makes you a strong candidate</p>
            <ul className="space-y-2">
              {(strengthBullets.length > 0 ? strengthBullets : [result.strengths]).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Gaps' && (
          <div>
            <p className="text-xs text-gray-400 mb-3">Areas to work on before applying</p>
            <ul className="space-y-2">
              {(gapBullets.length > 0 ? gapBullets : [result.gaps]).map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">!</span>{g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Action' && (
          <div>
            <p className="text-xs text-gray-400 mb-3">Recommended next steps</p>
            <ul className="space-y-2 mb-5">
              {(recBullets.length > 0 ? recBullets : [result.recommendation]).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/materials', { state: { opportunityTitle } })}
                className="btn-primary text-xs px-4 py-2 flex-1"
              >
                ✍️ Generate Cover Letter
              </button>
              <button
                onClick={() => navigate('/strategy')}
                className="btn-secondary text-xs px-4 py-2 flex-1"
              >
                🤖 Run Strategy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
