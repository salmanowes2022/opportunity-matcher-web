import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { runStrategy } from '../api/strategy.api';
import { getOpportunities } from '../api/opportunities.api';
import { useEffect } from 'react';

const STRATEGY_MODES = [
  {
    key: 'full_analysis',
    label: 'Full Analysis',
    icon: '🔍',
    description: 'Deep AI analysis of all saved opportunities against your profile with ranked recommendations',
  },
  {
    key: 'gap_action_plan',
    label: 'Gap Action Plan',
    icon: '📋',
    description: 'Identify skill and experience gaps then generate a step-by-step plan to close them',
  },
  {
    key: 'application_roadmap',
    label: 'Application Roadmap',
    icon: '🗺️',
    description: 'Build a timeline and checklist for applying to your top opportunities',
  },
  {
    key: 'profile_optimization',
    label: 'Profile Optimization',
    icon: '⚡',
    description: 'Get AI suggestions to strengthen your profile for maximum match scores',
  },
];

function ResultSection({ title, icon, content, variant = 'default' }) {
  const colors = {
    default: 'bg-gray-50 border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[variant]}`}>
      <h3 className="font-semibold text-gray-800 mb-3">{icon} {title}</h3>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
    </div>
  );
}

function OpportunityPicker({ opportunities, selected, onChange }) {
  if (!opportunities.length) return null;
  return (
    <div>
      <label className="label">Focus on specific opportunities (optional)</label>
      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
        {opportunities.map(opp => (
          <label key={opp.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={selected.includes(opp.id)}
              onChange={e => {
                if (e.target.checked) onChange([...selected, opp.id]);
                else onChange(selected.filter(id => id !== opp.id));
              }}
              className="rounded"
            />
            <span className="text-sm text-gray-700">{opp.title}</span>
            <span className="text-xs text-gray-400 ml-auto">{opp.opp_type}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function StrategyPage() {
  const [mode, setMode] = useState('full_analysis');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpps, setSelectedOpps] = useState([]);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    getOpportunities().then(setOpportunities).catch(() => {});
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await runStrategy({
        mode,
        notes: notes.trim() || undefined,
        opportunity_ids: selectedOpps.length ? selectedOpps : undefined,
      });
      setResult(data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Strategy run failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedMode = STRATEGY_MODES.find(m => m.key === mode);

  return (
    <div className="ml-64">
      <PageWrapper title="AI Strategy" subtitle="Let AI build your personalized opportunity strategy">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Config */}
          <div className="lg:col-span-1 space-y-5">
            <div className="card p-5 space-y-4">
              <div>
                <label className="label mb-2 block">Strategy Mode</label>
                <div className="space-y-2">
                  {STRATEGY_MODES.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        mode === m.key
                          ? 'bg-primary-50 border-primary-300 text-primary-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span>{m.icon}</span>
                        <span className="font-medium text-sm">{m.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-snug">{m.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <OpportunityPicker
                opportunities={opportunities}
                selected={selectedOpps}
                onChange={setSelectedOpps}
              />

              <div>
                <label className="label">Additional context (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Any specific goals, constraints, or focus areas..."
                />
              </div>

              <button
                onClick={handleRun}
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? '🤖 Running Strategy...' : `🚀 Run ${selectedMode?.label}`}
              </button>
            </div>

            {/* Tips */}
            <div className="card p-4 bg-blue-50 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips</h4>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>• Complete your profile first for better results</li>
                <li>• Save opportunities to get targeted advice</li>
                <li>• Run Gap Action Plan to know exactly what to improve</li>
                <li>• Use Application Roadmap before deadlines approach</li>
              </ul>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="card p-10 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" text="AI is building your strategy..." />
                <p className="text-xs text-gray-400 mt-4">This may take 20-30 seconds</p>
              </div>
            )}

            {!loading && !result && (
              <div className="card p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-gray-700 font-semibold text-lg mb-2">Ready to strategize</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Select a strategy mode and click Run to get AI-powered, personalized recommendations
                </p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                {result.summary && (
                  <ResultSection icon="📊" title="Summary" content={result.summary} variant="info" />
                )}
                {result.recommendations && (
                  <ResultSection icon="🎯" title="Recommendations" content={result.recommendations} variant="success" />
                )}
                {result.gaps && (
                  <ResultSection icon="⚠️" title="Gaps to Address" content={result.gaps} variant="warning" />
                )}
                {result.action_plan && (
                  <ResultSection icon="📋" title="Action Plan" content={result.action_plan} />
                )}
                {result.timeline && (
                  <ResultSection icon="🗓️" title="Timeline" content={result.timeline} />
                )}
                {result.profile_tips && (
                  <ResultSection icon="⚡" title="Profile Optimization Tips" content={result.profile_tips} variant="info" />
                )}
                {/* Catch-all for any other keys from the API */}
                {result.output && !result.summary && !result.recommendations && (
                  <ResultSection icon="🤖" title="Strategy Output" content={result.output} />
                )}
                {result.content && !result.summary && !result.output && (
                  <ResultSection icon="🤖" title="Strategy Output" content={result.content} />
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      showToast('Copied to clipboard!');
                    }}
                    className="btn-secondary text-xs px-4"
                  >
                    📋 Copy Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
