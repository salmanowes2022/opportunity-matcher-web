import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getProfile } from '../../api/profile.api';
import { getOpportunities } from '../../api/opportunities.api';

const navItems = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/profile',       icon: '👤', label: 'My Profile' },
  { to: '/match',         icon: '🎯', label: 'Check Match' },
  { to: '/tracker',       icon: '📋', label: 'Tracker' },
  { to: '/history',       icon: '📊', label: 'History' },
  { to: '/materials',     icon: '✍️', label: 'Materials' },
  { to: '/documents',     icon: '📄', label: 'Documents' },
  { to: '/opportunities', icon: '🗄️', label: 'Opportunities', badge: 'deadlines' },
  { to: '/discovery',     icon: '🔍', label: 'Discovery' },
  { to: '/smart-apply',   icon: '⚡', label: 'Smart Apply' },
  { to: '/interview',     icon: '🎤', label: 'Interview Prep' },
  { to: '/strategy',      icon: '🤖', label: 'AI Strategy' },
];

function ProfileMeter({ profile }) {
  if (!profile) return null;
  const fields = [
    profile.name, profile.education_level, profile.field_of_study,
    profile.skills, profile.languages, profile.achievements,
    profile.goals, profile.gpa, profile.experience_years,
  ];
  const filled = fields.filter(f => f && f !== 'Not specified' && f !== 'See CV for details').length;
  const pct = Math.round((filled / fields.length) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="px-3 pb-3">
      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Profile</span>
          <span className={`text-[10px] font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ user, profile, urgentCount, onSignOut, onNavClick }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-lg shadow-sm">🎯</div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Opportunity</h1>
            <h1 className="font-bold text-primary-600 text-sm leading-tight">Matcher</h1>
          </div>
        </div>
      </div>

      {/* Urgent deadline banner */}
      {urgentCount > 0 && (
        <div className="mx-3 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-red-500 text-sm">⚠️</span>
          <p className="text-[11px] font-semibold text-red-700 leading-tight">
            {urgentCount} deadline{urgentCount > 1 ? 's' : ''} within 7 days!
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base w-5 flex-shrink-0 text-center">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge === 'deadlines' && urgentCount > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {urgentCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile completeness meter */}
      <ProfileMeter profile={profile} />

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile?.name || user?.email}</p>
            {profile?.name && <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>}
          </div>
        </div>
        <button onClick={onSignOut} className="w-full text-left text-xs text-gray-400 hover:text-red-500 transition-colors">
          Sign out →
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [urgentCount, setUrgentCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});

    // Check for urgent deadlines (within 7 days)
    getOpportunities().then(opps => {
      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const urgent = opps.filter(o =>
        o.deadline &&
        new Date(o.deadline) >= now &&
        new Date(o.deadline) <= in7
      ).length;
      setUrgentCount(urgent);
    }).catch(() => {});
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            )}
          </>
        )}
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide in */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent
          user={user}
          profile={profile}
          urgentCount={urgentCount}
          onSignOut={handleSignOut}
          onNavClick={() => setMobileOpen(false)}
        />
      </div>
    </>
  );
}
