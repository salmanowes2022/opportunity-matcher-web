export function getScoreColor(score) {
  if (score >= 0.7) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', label: 'Excellent Match', hex: '#16a34a' };
  if (score >= 0.5) return { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', label: 'Good Match', hex: '#d97706' };
  return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', label: 'Needs Work', hex: '#dc2626' };
}

export function formatScore(score) {
  return `${(score * 100).toFixed(1)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
