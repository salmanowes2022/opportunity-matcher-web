import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MatchPage from './pages/MatchPage';
import TrackerPage from './pages/TrackerPage';
import HistoryPage from './pages/HistoryPage';
import MaterialsPage from './pages/MaterialsPage';
import DocumentsPage from './pages/DocumentsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import StrategyPage from './pages/StrategyPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected */}
          <Route path="/dashboard"     element={<Protected><DashboardPage /></Protected>} />
          <Route path="/profile"       element={<Protected><ProfilePage /></Protected>} />
          <Route path="/match"         element={<Protected><MatchPage /></Protected>} />
          <Route path="/tracker"       element={<Protected><TrackerPage /></Protected>} />
          <Route path="/history"       element={<Protected><HistoryPage /></Protected>} />
          <Route path="/materials"     element={<Protected><MaterialsPage /></Protected>} />
          <Route path="/documents"     element={<Protected><DocumentsPage /></Protected>} />
          <Route path="/opportunities" element={<Protected><OpportunitiesPage /></Protected>} />
          <Route path="/strategy"      element={<Protected><StrategyPage /></Protected>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
