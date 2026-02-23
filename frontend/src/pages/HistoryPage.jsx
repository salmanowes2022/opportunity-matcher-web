import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { getHistory, getHistoryStats, deleteHistoryItem } from '../api/history.api';
import { getScoreColor, formatScore, formatDate } from '../utils/scoreHelpers';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getHistory(), getHistoryStats()])
      .then(([h, s]) => { setHistory(h); setStats(s); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory(h => h.filter(r => r.id !== id));
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

  if (loading) return <div className="ml-64 p-8"><LoadingSpinner /></div>;

  return (
    <div className="ml-64">
      <PageWrapper title="Evaluation History" subtitle="All your past match evaluations">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
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

        {/* Table */}
        {history.length === 0 ? (
          <EmptyState icon="📊" title="No evaluations yet" description="Go to Check Match to evaluate your first opportunity"
            action={<button onClick={() => navigate('/match')} className="btn-primary px-6">Evaluate an Opportunity</button>}
          />
        ) : (
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
                {history.map(item => {
                  const score = Number(item.compatibility_score);
                  const colors = getScoreColor(score);
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.opportunity_title}</td>
                        <td className="px-4 py-3 text-gray-500">{item.opportunity_type}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={getBadgeVariant(score)}>{formatScore(score)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(item.evaluated_at)}</td>
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
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
