import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import MatchResultCard from '../components/match/MatchResultCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { evaluateMatch } from '../api/match.api';

const OPP_TYPES = ['Scholarship', 'Fellowship', 'Job', 'Academic Program', 'Internship', 'Other'];

const EMPTY_OPP = { title: '', opp_type: 'Scholarship', description: '', requirements: '', deadline: '' };

export default function MatchPage() {
  const location = useLocation();
  const prefilled = location.state?.opp;
  const [opp, setOpp] = useState(prefilled ? {
    title: prefilled.title || '',
    opp_type: prefilled.opp_type || 'Scholarship',
    description: prefilled.description || '',
    requirements: prefilled.requirements || '',
    deadline: prefilled.deadline || '',
  } : EMPTY_OPP);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveOpp, setSaveOpp] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOpp(o => ({ ...o, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await evaluateMatch({ opportunity: opp, save_opportunity: saveOpp });
      setResult(data.result);
      if (saveOpp) showToast('Match evaluated and opportunity saved!');
      else showToast('Match evaluated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Evaluation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageWrapper title="Check Match" subtitle="Paste any opportunity and see how well you match it">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Opportunity Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input name="title" value={opp.title} onChange={handleChange} className="input-field" required placeholder="e.g., Fulbright Scholarship 2025" />
              </div>
              <div>
                <label className="label">Type *</label>
                <select name="opp_type" value={opp.opp_type} onChange={handleChange} className="input-field">
                  {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea name="description" value={opp.description} onChange={handleChange} className="input-field" rows={4} required placeholder="Describe the opportunity..." />
              </div>
              <div>
                <label className="label">Requirements *</label>
                <textarea name="requirements" value={opp.requirements} onChange={handleChange} className="input-field" rows={4} required placeholder="List eligibility criteria and requirements..." />
              </div>
              <div>
                <label className="label">Deadline (optional)</label>
                <input type="date" name="deadline" value={opp.deadline} onChange={handleChange} className="input-field" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={saveOpp} onChange={e => setSaveOpp(e.target.checked)} className="rounded" />
                Save to my opportunities database
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? '🔍 Evaluating...' : '🎯 Evaluate Match'}
              </button>
            </form>
          </div>

          {/* Right: Result */}
          <div>
            {loading && <LoadingSpinner text="AI is evaluating your match..." />}
            {result && !loading && (
              <MatchResultCard result={result} opportunityTitle={opp.title} opportunity={opp} />
            )}
            {!result && !loading && (
              <div className="card p-6 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-gray-600 font-medium mb-1">Ready to evaluate</h3>
                <p className="text-sm text-gray-400">Fill in the opportunity details and click evaluate</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
