import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getDashboard } from '../api/dashboard.api';
import { useProfile } from '../hooks/useProfile';

function StatCard({ icon, label, value, sub, color = 'primary', onClick }) {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    green:   'from-green-500 to-green-600',
    amber:   'from-amber-500 to-amber-600',
    purple:  'from-purple-500 to-purple-600',
  };
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 text-white bg-gradient-to-br ${colors[color]} shadow-sm ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-medium opacity-90 mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

function DeadlineCountdown({ deadline }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="text-xs text-red-500 font-semibold">Expired</span>;
  if (days === 0) return <span className="text-xs text-red-600 font-bold animate-pulse">Due today!</span>;
  if (days <= 3) return <span className="text-xs text-red-500 font-bold">{days}d left</span>;
  if (days <= 7) return <span className="text-xs text-amber-500 font-semibold">{days}d left</span>;
  return <span className="text-xs text-gray-400">{days}d left</span>;
}

function ProfileCompleteness({ profile }) {
  if (!profile) return null;
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'education_level', label: 'Education' },
    { key: 'field_of_study', label: 'Field of Study' },
    { key: 'skills', label: 'Skills' },
    { key: 'languages', label: 'Languages' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'goals', label: 'Goals' },
    { key: 'gpa', label: 'GPA' },
    { key: 'experience_years', label: 'Experience' },
  ];
  const filled = fields.filter(f => profile[f.key] && profile[f.key] !== 'Not specified' && profile[f.key] !== 'See CV for details').length;
  const pct = Math.round((filled / fields.length) * 100);
  const missing = fields.filter(f => !profile[f.key] || profile[f.key] === 'Not specified' || profile[f.key] === 'See CV for details');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
        <span className={`text-sm font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {missing.length > 0 && pct < 100 && (
        <p className="text-xs text-gray-400">
          Missing: {missing.slice(0, 3).map(f => f.label).join(', ')}{missing.length > 3 ? ` +${missing.length - 3} more` : ''}
        </p>
      )}
    </div>
  );
}

const STATUS_LABELS = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-600' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="ml-64 flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  const statusBreakdown = stats?.status_breakdown || {};
  const upcomingDeadlines = stats?.upcoming_deadlines || [];

  return (
    <div className="ml-64">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName} 👋</h1>
            <p className="text-gray-500 mt-1 text-sm">Here's your opportunity overview for today</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="🗄️" label="Opportunities" value={stats?.total_opportunities ?? 0}
              color="primary" onClick={() => navigate('/opportunities')}
            />
            <StatCard
              icon="🎯" label="Evaluations" value={stats?.total_evaluations ?? 0}
              sub={stats?.avg_score ? `Avg score: ${stats.avg_score}%` : undefined}
              color="purple" onClick={() => navigate('/history')}
            />
            <StatCard
              icon="⭐" label="Best Match" value={stats?.best_score ? `${stats.best_score}%` : '—'}
              color="green" onClick={() => navigate('/history')}
            />
            <StatCard
              icon="✍️" label="Materials" value={stats?.total_materials ?? 0}
              color="amber" onClick={() => navigate('/materials')}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Upcoming deadlines */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">⏰ Upcoming Deadlines</h2>
                  <button onClick={() => navigate('/opportunities')} className="text-xs text-primary-600 hover:underline">View all</button>
                </div>
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No upcoming deadlines in the next 30 days</p>
                    <button onClick={() => navigate('/opportunities')} className="text-xs text-primary-600 hover:underline mt-2">Add opportunities →</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map(opp => {
                      const days = Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={opp.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${days <= 7 ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${days <= 3 ? 'bg-red-500' : days <= 7 ? 'bg-amber-400' : 'bg-green-400'}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{opp.title}</p>
                              <p className="text-xs text-gray-400">{opp.opp_type} · {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <DeadlineCountdown deadline={opp.deadline} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Application pipeline */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">📋 Application Pipeline</h2>
                  <button onClick={() => navigate('/tracker')} className="text-xs text-primary-600 hover:underline">Open tracker →</button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                    <div key={key} className={`rounded-xl p-3 text-center ${color}`}>
                      <div className="text-xl font-bold">{statusBreakdown[key] ?? 0}</div>
                      <div className="text-xs font-medium mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🎯', label: 'Check Match', desc: 'Evaluate a new opportunity', path: '/match' },
                    { icon: '📄', label: 'Upload CV', desc: 'Extract profile from document', path: '/documents' },
                    { icon: '🤖', label: 'Run Strategy', desc: 'Get AI recommendations', path: '/strategy' },
                    { icon: '✍️', label: 'Generate Materials', desc: 'Cover letter or SOP', path: '/materials' },
                  ].map(({ icon, label, desc, path }) => (
                    <button key={path} onClick={() => navigate(path)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left group">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">

              {/* Profile card */}
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-4">👤 Your Profile</h2>
                {profile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                        {profile.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{profile.name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile.education_level} · {profile.field_of_study}</p>
                      </div>
                    </div>
                    <ProfileCompleteness profile={profile} />
                    <button onClick={() => navigate('/profile')} className="w-full btn-secondary text-xs py-2">Edit Profile</button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-3">No profile yet — create one to get better matches</p>
                    <button onClick={() => navigate('/profile')} className="btn-primary text-xs px-4 py-2">Create Profile</button>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="card p-5 bg-gradient-to-br from-primary-50 to-white border-primary-100">
                <h2 className="font-semibold text-primary-800 mb-3">💡 Tips to improve</h2>
                <ul className="space-y-2.5 text-xs text-primary-700">
                  {[
                    !profile && 'Create your profile for accurate matches',
                    profile && (profile.gpa == null) && 'Add your GPA to boost match scores',
                    (stats?.total_evaluations ?? 0) === 0 && 'Evaluate your first opportunity in Check Match',
                    upcomingDeadlines.length === 0 && 'Save opportunities with deadlines to track them',
                    (stats?.total_materials ?? 0) === 0 && 'Generate a cover letter for your best match',
                  ].filter(Boolean).slice(0, 4).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary-400 mt-0.5">→</span>{tip}
                    </li>
                  ))}
                  {!profile && !((stats?.total_evaluations ?? 0) === 0) && !((stats?.total_materials ?? 0) === 0) && (
                    <li className="flex items-start gap-2">
                      <span className="text-primary-400 mt-0.5">→</span>Run AI Strategy for a full analysis
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
