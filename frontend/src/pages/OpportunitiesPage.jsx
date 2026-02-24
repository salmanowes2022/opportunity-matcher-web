import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity } from '../api/opportunities.api';
import { batchEvaluate } from '../api/match.api';
import { scrapeUrl } from '../api/scraper.api';
import { useNavigate } from 'react-router-dom';

const OPP_TYPES = ['Scholarship', 'Fellowship', 'Job', 'Academic Program', 'Internship', 'Other'];
const EMPTY_FORM = { title: '', opp_type: 'Scholarship', description: '', requirements: '', deadline: '' };
const FILTERS = ['All', 'Scholarship', 'Fellowship', 'Job', 'Internship', 'Other'];

function OpportunityModal({ opp, onSave, onClose }) {
  const [form, setForm] = useState(opp || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{opp?.id ? 'Edit Opportunity' : 'Add Opportunity'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="label">Title *</label><input name="title" value={form.title} onChange={handleChange} className="input-field" required placeholder="e.g., Fulbright Scholarship 2025" /></div>
          <div><label className="label">Type *</label>
            <select name="opp_type" value={form.opp_type} onChange={handleChange} className="input-field">
              {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Description *</label><textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} required /></div>
          <div><label className="label">Requirements *</label><textarea name="requirements" value={form.requirements} onChange={handleChange} className="input-field" rows={3} required /></div>
          <div><label className="label">Deadline</label><input type="date" name="deadline" value={form.deadline || ''} onChange={handleChange} className="input-field" /></div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScrapeModal({ onImport, onClose }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleScrape = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const data = await scrapeUrl(url); onImport(data); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Failed to import. Try adding manually.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Import from URL</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleScrape} className="p-5 space-y-4">
          <div><label className="label">Opportunity URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="input-field" required placeholder="https://example.com/scholarship" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? '🔍 Importing...' : '🌐 Import'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  if (score === undefined || score === null) return null;
  const pct = Math.round(score * 100);
  const cls = pct >= 70 ? 'bg-green-100 text-green-700 border-green-200'
    : pct >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-600 border-red-200';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>🎯 {pct}%</span>;
}

function typeColor(type) {
  const map = { Scholarship: 'green', Fellowship: 'blue', Job: 'amber', 'Academic Program': 'blue', Internship: 'amber', Other: 'gray' };
  return map[type] || 'gray';
}

function formatDeadline(d) {
  if (!d) return null;
  const date = new Date(d);
  const diff = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (diff < 0) return { label, urgent: false, expired: true };
  if (diff <= 7) return { label, urgent: true, expired: false };
  return { label, urgent: false, expired: false };
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async (q) => {
    setLoading(true);
    try { const data = await getOpportunities(q); setOpps(data); }
    catch { showToast('Failed to load opportunities', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAutoScore = async () => {
    if (opps.length === 0) return;
    setScoring(true);
    try {
      const { results } = await batchEvaluate(opps.map(o => o.id));
      const map = {};
      results.forEach(r => { map[r.opportunity_id] = r.compatibility_score; });
      setScores(map);
      setSortBy('score');
      showToast(`Scored ${results.length} opportunities!`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Scoring failed — make sure your profile is complete', 'error');
    } finally { setScoring(false); }
  };

  const handleSave = async (form) => {
    try {
      if (editing?.id) {
        const updated = await updateOpportunity(editing.id, form);
        setOpps(o => o.map(x => x.id === updated.id ? updated : x));
        showToast('Updated!');
      } else {
        const created = await createOpportunity(form);
        setOpps(o => [created, ...o]);
        showToast('Added!');
      }
      setModal(null); setEditing(null);
    } catch (err) { showToast(err.response?.data?.error || 'Save failed', 'error'); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteOpportunity(id);
      setOpps(o => o.filter(x => x.id !== id));
      const s = { ...scores }; delete s[id]; setScores(s);
      showToast('Deleted');
    } catch { showToast('Delete failed', 'error'); }
    finally { setDeleting(null); }
  };

  let displayed = opps.filter(o => filter === 'All' || o.opp_type === filter);
  if (sortBy === 'score') displayed = [...displayed].sort((a, b) => (scores[b.id] ?? -1) - (scores[a.id] ?? -1));
  else if (sortBy === 'deadline') displayed = [...displayed].sort((a, b) => (!a.deadline ? 1 : !b.deadline ? -1 : new Date(a.deadline) - new Date(b.deadline)));

  const scoredCount = Object.keys(scores).length;

  return (
    <div>
      <PageWrapper
        title="Opportunities"
        subtitle="Manage and auto-score all your saved opportunities"
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={handleAutoScore} disabled={scoring || opps.length === 0} className="btn-secondary flex items-center gap-1.5 text-sm">
              {scoring ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Scoring…</> : `🎯 Auto-Score All${scoredCount ? ` (${scoredCount}/${opps.length})` : ''}`}
            </button>
            <button onClick={() => setModal('scrape')} className="btn-secondary text-sm">🌐 Import URL</button>
            <button onClick={() => { setEditing(null); setModal('add'); }} className="btn-primary text-sm">+ Add</button>
          </div>
        }
      >
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }}
            placeholder="Search…" className="input-field max-w-xs" />
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{f}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            {[['date','📅 Date'], ['score','🎯 Score'], ['deadline','⏰ Deadline']].map(([s,l]) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${sortBy === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}>{l}</button>
            ))}
          </div>
        </div>

        {scoring && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-sm text-blue-700">
            <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            AI is scoring all {opps.length} opportunities against your profile… this may take 20–30 seconds
          </div>
        )}

        {loading ? <LoadingSpinner text="Loading…" /> : displayed.length === 0 ? (
          <EmptyState icon="🗄️" title="No opportunities found"
            description={opps.length === 0 ? "Add your first opportunity to get started" : "No results match your filter"}
            action={opps.length === 0 && (
              <div className="flex gap-2 justify-center">
                <button onClick={() => setModal('scrape')} className="btn-secondary px-5">Import from URL</button>
                <button onClick={() => { setEditing(null); setModal('add'); }} className="btn-primary px-5">Add Manually</button>
              </div>
            )}
          />
        ) : (
          <div className="space-y-3">
            {displayed.map(opp => {
              const dl = opp.deadline ? formatDeadline(opp.deadline) : null;
              const score = scores[opp.id];
              const borderColor = score >= 0.7 ? 'border-l-green-400' : score < 0.5 && score !== undefined ? 'border-l-red-300' : '';
              return (
                <div key={opp.id} className={`card p-4 hover:shadow-md transition-shadow ${borderColor ? `border-l-4 ${borderColor}` : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{opp.title}</h3>
                        <Badge variant={typeColor(opp.opp_type)}>{opp.opp_type}</Badge>
                        <ScoreBadge score={score} />
                        {dl && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dl.expired ? 'bg-gray-100 text-gray-400' : dl.urgent ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
                            {dl.expired ? 'Expired' : `Due ${dl.label}`}
                          </span>
                        )}
                      </div>
                      {(opp.provider || opp.location) && (
                        <p className="text-xs text-gray-400 mb-1">{[opp.provider, opp.location].filter(Boolean).join(' · ')}</p>
                      )}
                      <p className="text-sm text-gray-500 line-clamp-2">{opp.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => navigate('/match', { state: { opp } })} className="btn-primary text-xs px-3 py-1.5">🎯 Match</button>
                      <div className="flex gap-1">
                        <button title="Generate material" onClick={() => navigate('/materials', { state: { opp } })} className="btn-secondary text-xs px-2 py-1">✍️</button>
                        <button title="Interview prep" onClick={() => navigate('/interview', { state: { opp } })} className="btn-secondary text-xs px-2 py-1">🎤</button>
                        <button title="Edit" onClick={() => { setEditing(opp); setModal('edit'); }} className="btn-secondary text-xs px-2 py-1">✏️</button>
                        <button title="Delete" onClick={() => handleDelete(opp.id)} disabled={deleting === opp.id} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageWrapper>

      {(modal === 'add' || modal === 'edit') && <OpportunityModal opp={editing} onSave={handleSave} onClose={() => { setModal(null); setEditing(null); }} />}
      {modal === 'scrape' && <ScrapeModal onImport={(d) => { setEditing({ ...EMPTY_FORM, ...d }); setModal('add'); }} onClose={() => setModal(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
