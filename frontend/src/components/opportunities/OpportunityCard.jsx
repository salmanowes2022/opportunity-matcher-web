import React from 'react';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

function typeColor(type) {
  const map = {
    Scholarship: 'green',
    Fellowship: 'blue',
    Job: 'amber',
    'Academic Program': 'blue',
    Internship: 'amber',
    Other: 'gray',
  };
  return map[type] || 'gray';
}

export default function OpportunityCard({ opp, onEdit, onDelete, deleting }) {
  const navigate = useNavigate();
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{opp.title}</h3>
            <Badge variant={typeColor(opp.opp_type)}>{opp.opp_type}</Badge>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{opp.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate('/match', { state: { opp } })}
            className="btn-primary text-xs px-3 py-1.5"
          >
            🎯 Match
          </button>
          {onEdit && (
            <button onClick={() => onEdit(opp)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(opp.id)}
              disabled={deleting === opp.id}
              className="text-xs text-red-500 hover:text-red-700 transition-colors px-2"
            >
              {deleting === opp.id ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
