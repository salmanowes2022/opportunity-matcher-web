import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { runDiscovery } from '../api/discovery.api';

const PRIORITY_COLORS = {
  high:   { bg: 'bg-red-100',   text: 'text-red-700',   label: 'High Priority' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  low:    { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority' },
};

function SearchQueryCard({ q }) {
  const p = PRIORITY_COLORS[q.priority] || PRIORITY_COLORS.medium;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(q.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded flex-1">
          {q.query}
        </code>
        <button
          onClick={handleCopy}
          className={`text-xs px-2.5 py-1 rounded-lg border flex-shrink-0 transition-colors ${
            copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">{q.reasoning}</p>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
    </div>
  );
}

function SimilarOpportunityCard({ opp, onAdd, navigate }) {
  const pct = Math.round(opp.relevance_score * 100);
  const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
  const bg = pct >= 70 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">{opp.title}</h4>
          <p className="text-xs text-gray-500">{opp.type}</p>
        </div>
        <span className={`text-lg font-bold ${color} flex-shrink-0`}>{pct}%</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{opp.why_similar}</p>
      <button
        onClick={() => navigate('/opportunities')}
        className="btn-primary text-xs px-3 py-1.5"
      >
        + Add to Opportunities
      </button>
    </div>
  );
}

export default function DiscoveryPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDiscover = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await runDiscovery();
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Discovery failed. Make sure your profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const highPriorityQueries = result?.search_queries?.filter(q => q.priority === 'high') || [];
  const otherQueries = result?.search_queries?.filter(q => q.priority !== 'high') || [];

  return (
    <div>
      <PageWrapper
        title="Opportunity Discovery"
        subtitle="AI-powered search strategies to find opportunities you might have missed"
        action={
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Discovering…
              </>
            ) : result ? '🔄 Rediscover' : '🔍 Start Discovery'}
          </button>
        }
      >
        {!result && !loading && !error && (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Find Hidden Opportunities</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Our AI analyzes your profile and existing matches to generate smart search strategies
              and suggest similar opportunities you might not know about.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { icon: '🎯', title: 'Smart Queries', desc: 'Specific search terms tailored to you' },
                { icon: '💡', title: 'Hidden Gems', desc: 'Niche opportunities in your field' },
                { icon: '🔗', title: 'Similar Matches', desc: 'Opportunities like your top matches' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <button onClick={handleDiscover} className="btn-primary px-8 py-3">
              🔍 Start Discovery
            </button>
          </div>
        )}

        {loading && (
          <div className="card p-10 text-center">
            <LoadingSpinner text="AI is analyzing your profile and discovering opportunities…" />
            <p className="text-xs text-gray-400 mt-3">This may take 20–30 seconds</p>
          </div>
        )}

        {error && (
          <div className="card p-5 border-red-200 bg-red-50">
            <p className="text-sm text-red-700 mb-3">{error}</p>
            {error.includes('profile') && (
              <button onClick={() => navigate('/profile')} className="btn-primary text-sm px-4">
                Create Profile
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Strategic Recommendation */}
            <div className="card p-5 border-l-4 border-l-primary-500 bg-primary-50">
              <h2 className="font-semibold text-primary-800 mb-2">🤖 AI Strategy</h2>
              <p className="text-sm text-primary-700">{result.recommendation}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left — Search Queries */}
              <div className="lg:col-span-2 space-y-6">
                {/* High Priority Searches */}
                {highPriorityQueries.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-gray-800 mb-4">
                      🔥 High Priority Searches
                      <span className="ml-2 text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Do these first</span>
                    </h2>
                    <div className="space-y-3">
                      {highPriorityQueries.map((q, i) => (
                        <SearchQueryCard key={i} q={q} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Searches */}
                {otherQueries.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-gray-800 mb-4">🔍 More Search Ideas</h2>
                    <div className="space-y-3">
                      {otherQueries.map((q, i) => (
                        <SearchQueryCard key={i} q={q} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden Opportunities */}
                {result.hidden_opportunities?.length > 0 && (
                  <div className="card p-5">
                    <h2 className="font-semibold text-gray-800 mb-4">💎 Hidden Gems</h2>
                    <p className="text-xs text-gray-400 mb-3">Niche programs you might not know about</p>
                    <div className="space-y-2">
                      {result.hidden_opportunities.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
                          <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">💡</span>
                          <p className="text-sm text-gray-700">{h}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Similar Opportunities */}
              <div className="space-y-4">
                <div className="card p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">🔗 Similar to Your Matches</h2>
                  {result.similar_opportunities?.length > 0 ? (
                    <div className="space-y-3">
                      {result.similar_opportunities.map((opp, i) => (
                        <SimilarOpportunityCard key={i} opp={opp} navigate={navigate} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No similar opportunities found. Evaluate some opportunities first to get better suggestions.</p>
                  )}
                </div>

                {/* Where to Search */}
                <div className="card p-5">
                  <h2 className="font-semibold text-gray-800 mb-3 text-sm">🌐 Where to Search</h2>
                  <ul className="space-y-1.5">
                    {[
                      'scholarships.com',
                      'opportunitydesk.org',
                      'idealist.org',
                      'LinkedIn Jobs',
                      'Chegg Scholarships',
                      'DAAD (for Germany)',
                      'Fulbright Programs',
                      'Gates Foundation',
                    ].map(site => (
                      <li key={site} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="text-gray-300">→</span>{site}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </div>
  );
}
