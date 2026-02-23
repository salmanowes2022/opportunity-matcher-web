import React from 'react';

export default function MaterialCard({ material, onExport }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">{material.opportunity_title || 'Untitled'}</p>
        <p className="text-xs text-gray-400 capitalize">
          {material.material_type?.replace(/_/g, ' ')} &bull; {material.word_count} words
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onExport(material.id, 'pdf')} className="btn-secondary text-xs px-3 py-1">PDF</button>
        <button onClick={() => onExport(material.id, 'txt')} className="btn-secondary text-xs px-3 py-1">TXT</button>
      </div>
    </div>
  );
}
