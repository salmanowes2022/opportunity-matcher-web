import React from 'react';

export default function StrategyModeCard({ mode, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(mode.key)}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        selected
          ? 'bg-primary-50 border-primary-300 text-primary-800'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span>{mode.icon}</span>
        <span className="font-medium text-sm">{mode.label}</span>
      </div>
      <p className="text-xs text-gray-500 leading-snug">{mode.description}</p>
    </button>
  );
}
