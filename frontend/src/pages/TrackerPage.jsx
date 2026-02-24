import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { getOpportunities } from '../api/opportunities.api';
import { updateOpportunityStatus } from '../api/dashboard.api';

const COLUMNS = [
  { key: 'saved',     label: 'Saved',     icon: '🔖', color: 'bg-gray-50  border-gray-200',  badge: 'bg-gray-100  text-gray-600'  },
  { key: 'applied',   label: 'Applied',   icon: '📤', color: 'bg-blue-50  border-blue-200',   badge: 'bg-blue-100  text-blue-700'  },
  { key: 'interview', label: 'Interview', icon: '🤝', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700'},
  { key: 'accepted',  label: 'Accepted',  icon: '✅', color: 'bg-green-50  border-green-200',  badge: 'bg-green-100  text-green-700' },
  { key: 'rejected',  label: 'Rejected',  icon: '❌', color: 'bg-red-50    border-red-200',    badge: 'bg-red-100    text-red-600'   },
];

const NEXT_STATUS = {
  saved:     'applied',
  applied:   'interview',
  interview: 'accepted',
};

const PREV_STATUS = {
  applied:   'saved',
  interview: 'applied',
  accepted:  'interview',
  rejected:  'applied',
};

function DeadlinePill({ deadline }) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="text-[10px] text-red-400 font-medium">Expired</span>;
  if (days === 0) return <span className="text-[10px] text-red-500 font-bold">Due today!</span>;
  const color = days <= 3 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-gray-400';
  return <span className={`text-[10px] font-medium ${color}`}>{days}d left</span>;
}

function OppCard({ opp, onStatusChange, loading }) {
  const navigate = useNavigate();
  const col = COLUMNS.find(c => c.key === (opp.status || 'saved'));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Type + deadline */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{opp.opp_type}</span>
        <DeadlinePill deadline={opp.deadline} />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-800 leading-tight mb-3">{opp.title}</p>

      {/* Provider / location */}
      {(opp.provider || opp.location) && (
        <p className="text-xs text-gray-400 mb-3 truncate">
          {[opp.provider, opp.location].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PREV_STATUS[opp.status || 'saved'] && (
          <button
            onClick={() => onStatusChange(opp.id, PREV_STATUS[opp.status || 'saved'])}
            disabled={loading}
            className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-40 transition-colors"
          >← Back</button>
        )}
        {NEXT_STATUS[opp.status || 'saved'] && (
          <button
            onClick={() => onStatusChange(opp.id, NEXT_STATUS[opp.status || 'saved'])}
            disabled={loading}
            className="text-[10px] px-2 py-1 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 disabled:opacity-40 transition-colors"
          >Move →</button>
        )}
        {(opp.status === 'applied' || opp.status === 'interview') && (
          <button
            onClick={() => onStatusChange(opp.id, 'rejected')}
            disabled={loading}
            className="text-[10px] px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors ml-auto"
          >Rejected</button>
        )}
        <button
          onClick={() => navigate('/match', { state: { opp } })}
          className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors ml-auto"
        >Check Match</button>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    getOpportunities()
      .then(setOpps)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    setUpdating(id);
    try {
      const updated = await updateOpportunityStatus(id, newStatus);
      setOpps(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o));
      showToast(`Moved to ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  }, [showToast]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner text="Loading tracker..." />
    </div>
  );

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = opps.filter(o => (o.status || 'saved') === col.key);
    return acc;
  }, {});

  const total = opps.length;
  const applied = (byStatus.applied?.length || 0) + (byStatus.interview?.length || 0) + (byStatus.accepted?.length || 0);
  const successRate = applied > 0 && byStatus.accepted?.length > 0
    ? Math.round((byStatus.accepted.length / applied) * 100)
    : null;

  return (
    <div>
      <PageWrapper
        title="Application Tracker"
        subtitle="Track your application progress from saved to accepted"
      >
        {/* Summary row */}
        {total > 0 && (
          <div className="flex items-center gap-6 mb-6 p-4 bg-white rounded-xl border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            {COLUMNS.map(col => (
              <div key={col.key} className="text-center">
                <div className="text-xl font-bold text-gray-800">{byStatus[col.key]?.length || 0}</div>
                <div className="text-xs text-gray-400">{col.label}</div>
              </div>
            ))}
            {successRate !== null && (
              <>
                <div className="w-px h-8 bg-gray-200 ml-auto" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                  <div className="text-xs text-gray-400">Success rate</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Kanban board */}
        {total === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold text-gray-700 mb-1">No opportunities to track yet</p>
            <p className="text-sm text-gray-400 mb-4">Save opportunities from the Opportunities page or via Check Match</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3 overflow-x-auto">
            {COLUMNS.map(col => (
              <div key={col.key} className={`rounded-xl border p-3 ${col.color} min-w-[200px]`}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{col.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                    {byStatus[col.key]?.length || 0}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 min-h-[200px]">
                  {byStatus[col.key]?.length === 0 ? (
                    <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-xs text-gray-300">Empty</p>
                    </div>
                  ) : byStatus[col.key].map(opp => (
                    <OppCard
                      key={opp.id}
                      opp={opp}
                      onStatusChange={handleStatusChange}
                      loading={updating === opp.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
