import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { getHistory, getHistoryStats, deleteHistoryItem } from '../api/history.api';
import { getScoreColor, formatScore, formatDate } from '../utils/scoreHelpers';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 20;
const SCORE_FILTERS = [
  { label: 'All Scores', min: 0, max: 1 },
  { label: '70%+ (Excellent)', min: 0.7, max: 1 },
  { label: '50–69% (Good)', min: 0.5, max: 0.699 },
  { label: 'Below 50%', min: 0, max: 0.499 },
];

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState(SCORE_FILTERS[0]);
  const [page, setPage] = useState(0);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async (p = 0, q = search, sf = scoreFilter) => {
    setLoading(true);
    try {
      const [{ history: items, total: t }, s] = await Promise.all([
        getHistory({ limit: PAGE_SIZE, offset: p * PAGE_SIZE, search: q, min_score: sf.min, max_score: sf.max }),
        stats === null ? getHistoryStats() : Promise.resolve(stats),
      ]);
      setHistory(items);
      setTotal(t);
      if (stats === null) setStats(s);
    } catch {
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, scoreFilter, stats]);

  useEffect(() => { load(0); }, []);

  const handleSearch = (q) => {
    setSearch(q);
    setPage(0);
    load(0, q, scoreFilter);
  };

  const handleScoreFilter = (sf) => {
    setScoreFilter(sf);
    setPage(0);
    load(0, search, sf);
  };

  const handlePage = (p) => {
    setPage(p);
    load(p, search, scoreFilter);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory(h => h.filter(r => r.id !== id));
      setTotal(t => t - 1);
      showToast('Deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const getBadgeVariant = (score) => {
    if (score >= 0.7) return 'green';
    if (score >= 0.5) return 'amber';
    return 'red';
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PageWrapper title="Evaluation History" subtitle="All your past match evaluations">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Evaluations', value: stats.total },
              { label: 'Average Score', value: formatScore(stats.avg_score) },
              { label: 'Best Match', value: formatScore(stats.best_match) },
              { label: 'Materials Generated', value: stats.materials_generated },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by opportunity name…"
            className="input-field max-w-xs"
          />
          <div className="flex gap-1 flex-wrap">
            {SCORE_FILTERS.map(sf => (
              <button
                key={sf.label}
                onClick={() => handleScoreFilter(sf)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  scoreFilter.label === sf.label
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
          {total > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Loading…" />
        ) : history.length === 0 ? (
          <EmptyState icon="📊" title="No evaluations found"
            description={search || scoreFilter.min > 0 ? "No results match your filters" : "Go to Check Match to evaluate your first opportunity"}
            action={!search && <button onClick={() => navigate('/match')} className="btn-primary px-6">Evaluate an Opportunity</button>}
          />
        ) : (
          <>
            <div className="card overflow-hidden">
              {/* Desktop table */}
              <div className="hidden lg:block">
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
                    {history.map(item => {
                      const score = Number(item.compatibility_score);
                      const colors = getScoreColor(score);
                      return (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{item.opportunity_title}</td>
                            <td className="px-4 py-3 text-gray-500">{item.opportunity_type}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={getBadgeVariant(score)}>{formatScore(score)}</Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(item.evaluated_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                                className="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                          </tr>
                          {expanded === item.id && (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 bg-gray-50">
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                  <div className="p-3 bg-green-50 rounded-lg"><strong className="text-green-800 block mb-1">✅ Strengths</strong><p className="text-green-700">{item.strengths}</p></div>
                                  <div className="p-3 bg-amber-50 rounded-lg"><strong className="text-amber-800 block mb-1">⚠️ Gaps</strong><p className="text-amber-700">{item.gaps}</p></div>
                                  <div className="p-3 bg-blue-50 rounded-lg"><strong className="text-blue-800 block mb-1">💡 Recommendation</strong><p className="text-blue-700">{item.recommendation}</p></div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button onClick={() => navigate('/match', { state: { opp: { title: item.opportunity_title, opp_type: item.opportunity_type, description: item.opportunity_description || '', requirements: '' } } })}
                                    className="btn-secondary text-xs px-3 py-1.5">🔄 Re-evaluate</button>
                                  <button onClick={() => navigate('/materials', { state: { opportunityTitle: item.opportunity_title } })}
                                    className="btn-secondary text-xs px-3 py-1.5">✍️ Generate Material</button>
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

              {/* Mobile card list */}
              <div className="lg:hidden divide-y divide-gray-100">
                {history.map(item => {
                  const score = Number(item.compatibility_score);
                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.opportunity_title}</p>
                          <p className="text-xs text-gray-400">{item.opportunity_type} · {formatDate(item.evaluated_at)}</p>
                        </div>
                        <Badge variant={getBadgeVariant(score)}>{formatScore(score)}</Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                          className="text-xs text-primary-600 hover:underline">
                          {expanded === item.id ? 'Less ▲' : 'Details ▼'}
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 ml-auto">Delete</button>
                      </div>
                      {expanded === item.id && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="p-2 bg-green-50 rounded-lg"><strong className="text-green-800">Strengths: </strong><span className="text-green-700">{item.strengths}</span></div>
                          <div className="p-2 bg-amber-50 rounded-lg"><strong className="text-amber-800">Gaps: </strong><span className="text-amber-700">{item.gaps}</span></div>
                          <div className="p-2 bg-blue-50 rounded-lg"><strong className="text-blue-800">Recommendation: </strong><span className="text-blue-700">{item.recommendation}</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-xs text-gray-400">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePage(page - 1)}
                    disabled={page === 0}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePage(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          p === page ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
