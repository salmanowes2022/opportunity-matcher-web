import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

const navItems = [
  { to: '/profile', icon: '👤', label: 'My Profile' },
  { to: '/match', icon: '🎯', label: 'Check Match' },
  { to: '/history', icon: '📊', label: 'History' },
  { to: '/materials', icon: '✍️', label: 'Materials' },
  { to: '/documents', icon: '📄', label: 'Documents' },
  { to: '/opportunities', icon: '🗄️', label: 'Opportunities' },
  { to: '/strategy', icon: '🤖', label: 'AI Strategy' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Opportunity</h1>
            <h1 className="font-bold text-primary-600 text-sm leading-tight">Matcher</h1>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full text-left text-xs text-gray-500 hover:text-red-600 transition-colors">
          Sign out →
        </button>
      </div>
    </div>
  );
}
