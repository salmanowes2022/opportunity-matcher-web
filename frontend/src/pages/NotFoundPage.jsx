import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🎯</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-8">This page doesn't exist</p>
      <button onClick={() => navigate('/match')} className="btn-primary px-8 py-3">
        Go to Check Match
      </button>
    </div>
  );
}
