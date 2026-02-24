import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { runStrategy } from '../api/strategy.api';
import { getOpportunities } from '../api/opportunities.api';

const STRATEGY_MODES = [
  {
    key: 'full_analysis',
    label: 'Full Analysis',
    icon: '🔍',
    description: 'Deep AI analysis of all opportunities against your profile with ranked recommendations',
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

/* ── small helpers ── */
function Badge({ text, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>{text}</span>;
}

function Section({ icon, title, children, accent = 'gray' }) {
  const accents = {
    gray:   'border-gray-200   bg-gray-50',
    blue:   'border-blue-200   bg-blue-50',
    green:  'border-green-200  bg-green-50',
    amber:  'border-amber-200  bg-amber-50',
    purple: 'border-purple-200 bg-purple-50',
  };
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

function ScoreRing({ value, max, label, color = '#6366f1' }) {
  const pct = Math.round((value / max) * 100);
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-bold text-gray-800 -mt-10 mb-5">{value}/{max}</span>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── result renderers ── */
function ProfileOptimizationResult({ data }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="space-y-4">
      {/* Score row */}
      <Section icon="📊" title="Profile Strength" accent="blue">
        <div className="flex items-center justify-around py-2">
          <ScoreRing value={data.profile_strength_score ?? 0} max={10} label="Strength Score" color="#6366f1" />
          <ScoreRing value={data.completeness_percentage ?? 0} max={100} label="Completeness %" color="#10b981" />
          <ScoreRing value={Math.round((data.match_potential_increase ?? 0) * 10) / 10} max={10} label="Match Potential +" color="#f59e0b" />
        </div>
      </Section>

      {/* Quick wins */}
      {data.quick_wins?.length > 0 && (
        <Section icon="⚡" title="Quick Wins" accent="green">
          <div className="space-y-2">
            {data.quick_wins.map((w, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-green-100">
                <Badge text={w.priority} color={w.priority === 'high' ? 'red' : w.priority === 'medium' ? 'yellow' : 'gray'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{w.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{w.impact} · {w.time_estimate}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Critical gaps */}
      {data.critical_gaps?.length > 0 && (
        <Section icon="⚠️" title="Critical Gaps" accent="amber">
          <div className="space-y-2">
            {data.critical_gaps.map((g, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <Badge text={g.severity} color={g.severity === 'critical' ? 'red' : g.severity === 'moderate' ? 'yellow' : 'gray'} />
                  <span className="text-sm font-medium text-gray-800">{g.category}</span>
                </div>
                <p className="text-xs text-gray-600">{g.description}</p>
                <p className="text-xs text-gray-400 mt-1">Impact: {g.impact}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.overall_recommendation && (
        <Section icon="💡" title="Overall Recommendation" accent="purple">
          <p className="text-sm text-gray-700 leading-relaxed">{data.overall_recommendation}</p>
        </Section>
      )}
    </div>
  );
}

function ApplicationStrategyResult({ data }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="space-y-4">
      {/* Summary row */}
      {(data.effort_estimate_total_hours !== undefined || data.strategy_summary) && (
        <Section icon="📊" title="Strategy Summary" accent="blue">
          {data.strategy_summary && <p className="text-sm text-gray-700 leading-relaxed mb-3">{data.strategy_summary}</p>}
          {data.effort_estimate_total_hours !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Estimated total effort:</span>
              <Badge text={`${data.effort_estimate_total_hours}h`} color="purple" />
            </div>
          )}
        </Section>
      )}

      {/* Prioritized applications */}
      {data.prioritized_applications?.length > 0 && (
        <Section icon="🎯" title="Prioritized Applications" accent="green">
          <div className="space-y-3">
            {data.prioritized_applications.map((app, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-800">{app.opportunity_title}</p>
                  <Badge
                    text={app.priority_level}
                    color={app.priority_level === 'High' ? 'red' : app.priority_level === 'Medium' ? 'yellow' : 'gray'}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                  <span>🎯 Match: {Math.round((app.match_score ?? 0) * 100)}%</span>
                  <span>✅ Success: {Math.round((app.success_probability ?? 0) * 100)}%</span>
                  <span>⏱ {app.estimated_effort_hours}h effort</span>
                  {app.deadline && <span>📅 {app.deadline}</span>}
                </div>
                <p className="text-xs text-gray-600">{app.reasoning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Weekly timeline */}
      {data.weekly_timeline?.length > 0 && (
        <Section icon="🗓️" title="Weekly Timeline" accent="gray">
          <div className="space-y-3">
            {data.weekly_timeline.map((week, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">{week.week}</p>
                {week.tasks?.length > 0 && (
                  <ul className="space-y-1">
                    {week.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-gray-300 mt-0.5">•</span>{t}
                      </li>
                    ))}
                  </ul>
                )}
                {week.deadline_focus?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {week.deadline_focus.map((d, j) => <Badge key={j} text={d} color="blue" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.recommended_focus?.length > 0 && (
        <Section icon="🚀" title="Recommended Focus" accent="purple">
          <ul className="space-y-1.5">
            {data.recommended_focus.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-400 font-bold mt-0.5">{i + 1}.</span>{f}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function StrategyResults({ result }) {
  const [tab, setTab] = useState('overview');

  const tabs = [
    { key: 'overview',  label: 'Overview' },
    { key: 'profile',   label: 'Profile' },
    { key: 'strategy',  label: 'Applications' },
  ];

  const priorityActions = result.priority_actions || [];
  const nextSteps = result.recommended_next_steps || [];
  const successProb = result.success_probability ?? 0;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Strategy Complete</p>
          <h3 className="font-semibold text-gray-800 mt-0.5">AI Analysis Results</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Success probability:</span>
          <span className={`text-sm font-bold ${successProb >= 0.6 ? 'text-green-600' : successProb >= 0.4 ? 'text-yellow-600' : 'text-red-500'}`}>
            {Math.round(successProb * 100)}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {tab === 'overview' && (
          <>
            {/* Priority Actions */}
            {priorityActions.length > 0 && (
              <Section icon="🔥" title="Priority Actions" accent="amber">
                <ul className="space-y-2">
                  {priorityActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <Section icon="👣" title="Recommended Next Steps" accent="green">
                <ul className="space-y-2">
                  {nextSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Time investment */}
            {result.time_investment_hours > 0 && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Total time investment</p>
                  <p className="text-xs text-gray-500">{result.time_investment_hours} hours estimated across all applications</p>
                </div>
              </div>
            )}

            {priorityActions.length === 0 && nextSteps.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No overview data. Check Profile or Applications tabs.</p>
            )}
          </>
        )}

        {tab === 'profile' && (
          <ProfileOptimizationResult data={result.profile_optimization} />
        )}

        {tab === 'strategy' && (
          <ApplicationStrategyResult data={result.application_strategy} />
        )}
      </div>
    </div>
  );
}

function OpportunityPicker({ opportunities, selected, onChange }) {
  if (!opportunities.length) return null;
  return (
    <div>
      <label className="label">Focus on specific opportunities (optional)</label>
      <div className="space-y-1 max-h-44 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
        {opportunities.map(opp => (
          <label key={opp.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={selected.includes(opp.id)}
              onChange={e => {
                if (e.target.checked) onChange([...selected, opp.id]);
                else onChange(selected.filter(id => id !== opp.id));
              }}
              className="rounded accent-primary-600"
            />
            <span className="text-sm text-gray-700 flex-1 truncate">{opp.title}</span>
            <span className="text-xs text-gray-400 shrink-0">{opp.opp_type}</span>
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
    <div>
      <PageWrapper title="AI Strategy" subtitle="Let AI build your personalized opportunity strategy">
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ── Left: Config panel ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5 space-y-5">
              {/* Mode selector */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Strategy Mode</p>
                <div className="space-y-2">
                  {STRATEGY_MODES.map(m => (
                    <button key={m.key} onClick={() => setMode(m.key)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        mode === m.key
                          ? 'bg-primary-50 border-primary-300 text-primary-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span>{m.icon}</span>
                        <span className="font-medium text-sm">{m.label}</span>
                        {mode === m.key && <span className="ml-auto text-primary-500 text-xs">✓</span>}
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
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any specific goals, constraints, or focus areas..."
                />
              </div>

              <button onClick={handleRun} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Running...</>
                  : <><span>🚀</span> Run {selectedMode?.label}</>
                }
              </button>
            </div>

            {/* Tips */}
            <div className="card p-4 bg-blue-50 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips</h4>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>• Complete your profile first for better results</li>
                <li>• Save opportunities to get targeted advice</li>
                <li>• Run Gap Action Plan to know what to improve</li>
                <li>• Use Application Roadmap before deadlines</li>
              </ul>
            </div>
          </div>

          {/* ── Right: Results panel ── */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="AI is building your strategy..." />
                <p className="text-xs text-gray-400 mt-4">This may take 20–30 seconds</p>
              </div>
            )}

            {!loading && !result && (
              <div className="card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center text-4xl mb-4">🤖</div>
                <h3 className="text-gray-700 font-semibold text-lg mb-2">Ready to strategize</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Select a strategy mode on the left and click Run to get AI-powered, personalized recommendations
                </p>
              </div>
            )}

            {!loading && result && <StrategyResults result={result} />}
          </div>
        </div>
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
