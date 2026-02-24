import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getInterviewPrep } from '../api/interview.api';
import { getOpportunities } from '../api/opportunities.api';

const CATEGORY_COLORS = {
  behavioral:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Behavioral' },
  technical:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Technical' },
  motivational:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Motivational' },
  situational:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Situational' },
};

const DIFFICULTY_COLORS = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
};

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const [answer, setAnswer] = useState('');
  const cat = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.behavioral;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${cat.border}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-start gap-3 p-4 text-left ${cat.bg} hover:opacity-90 transition-opacity`}
      >
        <span className={`text-sm font-bold ${cat.text} mt-0.5 flex-shrink-0`}>Q{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{q.question}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text} border ${cat.border}`}>{cat.label}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty]}`}>{q.difficulty}</span>
          </div>
        </div>
        <span className={`text-gray-400 text-sm flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="p-4 bg-white space-y-3">
          <div className="rounded-lg bg-green-50 border border-green-100 p-3">
            <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide mb-1">Ideal Answer Framework</p>
            <p className="text-sm text-gray-700">{q.ideal_answer_outline}</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Pro Tips</p>
            <p className="text-sm text-gray-700">{q.tips}</p>
          </div>

          {practicing ? (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Your practice answer:</p>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your practice answer here..."
                className="input-field text-sm"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setPracticing(false); setAnswer(''); }} className="btn-secondary text-xs px-3 py-1.5">Done</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setPracticing(true)} className="btn-secondary text-xs px-3 py-1.5">
              ✍️ Practice my answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(location.state?.opp || null);
  const [opportunities, setOpportunities] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!opp) {
      getOpportunities().then(setOpportunities).catch(() => {});
    }
  }, [opp]);

  const handleGenerate = async () => {
    if (!opp) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getInterviewPrep(opp);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate. Please ensure your profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = result?.questions?.filter(q =>
    activeFilter === 'all' || q.category === activeFilter
  ) || [];

  const categoryCount = (cat) => result?.questions?.filter(q => q.category === cat).length || 0;

  return (
    <div>
      <PageWrapper
        title="Interview Prep"
        subtitle="AI-powered interview coaching tailored to your profile and target opportunity"
      >
        {/* Opportunity Selector */}
        {!opp ? (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Select an Opportunity</h2>
            {opportunities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No opportunities saved yet</p>
                <button onClick={() => navigate('/opportunities')} className="btn-primary text-sm px-4">Add Opportunities</button>
              </div>
            ) : (
              <div className="grid gap-2">
                {opportunities.map(o => (
                  <button
                    key={o.id}
                    onClick={() => setOpp(o)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                  >
                    <span className="text-lg">🎤</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.title}</p>
                      <p className="text-xs text-gray-400">{o.opp_type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Selected opportunity */}
            <div className="card p-4 mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">🎤</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Preparing for</p>
                  <p className="font-semibold text-gray-900 truncate">{opp.title}</p>
                  <p className="text-xs text-gray-400">{opp.opp_type}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!result && (
                  <button
                    onClick={() => { setOpp(null); setResult(null); }}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Change
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Generating…
                    </span>
                  ) : result ? '🔄 Regenerate' : '🎯 Generate Prep'}
                </button>
              </div>
            </div>

            {loading && (
              <div className="card p-8 text-center">
                <LoadingSpinner text="AI is crafting your personalized interview prep…" />
                <p className="text-xs text-gray-400 mt-3">This takes about 15–20 seconds</p>
              </div>
            )}

            {error && (
              <div className="card p-4 border-red-200 bg-red-50">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Opening Statement */}
                <div className="card p-5 border-l-4 border-l-primary-500">
                  <h2 className="font-semibold text-gray-800 mb-2">🎙️ Opening Statement Template</h2>
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{result.opening_statement}"</p>
                </div>

                {/* Key Themes + Tips + Mistakes */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">🎯 Key Themes</h3>
                    <ul className="space-y-1.5">
                      {result.key_themes.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-primary-500 font-bold mt-0.5 flex-shrink-0">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">✅ Preparation Tips</h3>
                    <ul className="space-y-1.5">
                      {result.preparation_tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">⚠️ Common Mistakes</h3>
                    <ul className="space-y-1.5">
                      {result.common_mistakes.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">!</span>{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Questions */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">📝 Practice Questions ({result.questions.length})</h2>
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'behavioral', 'motivational', 'technical', 'situational'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveFilter(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize ${
                            activeFilter === cat
                              ? 'bg-gray-800 text-white border-gray-800'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {cat === 'all' ? `All (${result.questions.length})` : `${cat} (${categoryCount(cat)})`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredQuestions.map((q, i) => (
                      <QuestionCard key={i} q={q} index={result.questions.indexOf(q)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </div>
  );
}
