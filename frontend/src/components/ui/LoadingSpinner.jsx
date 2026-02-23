import React from 'react';

export default function LoadingSpinner({ size = 'md', text = null }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizes[size]}`}></div>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
