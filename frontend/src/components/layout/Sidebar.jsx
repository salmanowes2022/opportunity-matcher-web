import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getProfile } from '../../api/profile.api';

const navItems = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/profile',       icon: '👤', label: 'My Profile' },
  { to: '/match',         icon: '🎯', label: 'Check Match' },
  { to: '/tracker',       icon: '📋', label: 'Tracker' },
  { to: '/history',       icon: '📊', label: 'History' },
  { to: '/materials',     icon: '✍️', label: 'Materials' },
  { to: '/documents',     icon: '📄', label: 'Documents' },
  { to: '/opportunities', icon: '🗄️', label: 'Opportunities' },
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

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-10">
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base w-5 flex-shrink-0 text-center">{icon}</span>
            {label}
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
        <button onClick={handleSignOut} className="w-full text-left text-xs text-gray-400 hover:text-red-500 transition-colors">
          Sign out →
        </button>
      </div>
    </div>
  );
}
