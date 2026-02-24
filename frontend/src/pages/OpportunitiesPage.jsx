import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../api/opportunities.api';
import { scrapeUrl, extractFromImage } from '../api/scraper.api';
import { useNavigate } from 'react-router-dom';

const OPP_TYPES = ['Scholarship', 'Fellowship', 'Job', 'Academic Program', 'Internship', 'Other'];

const EMPTY_FORM = { title: '', opp_type: 'Scholarship', description: '', requirements: '', deadline: '' };

function OpportunityModal({ opp, onSave, onClose }) {
  const [form, setForm] = useState(opp || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{opp?.id ? 'Edit Opportunity' : 'Add Opportunity'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" required placeholder="e.g., Fulbright Scholarship 2025" />
          </div>
          <div>
            <label className="label">Type *</label>
            <select name="opp_type" value={form.opp_type} onChange={handleChange} className="input-field">
              {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} required placeholder="Describe the opportunity..." />
          </div>
          <div>
            <label className="label">Requirements *</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} className="input-field" rows={3} required placeholder="List eligibility criteria..." />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" name="deadline" value={form.deadline || ''} onChange={handleChange} className="input-field" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save'}
            </button>
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
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await scrapeUrl(url);
      onImport(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to import from URL. Try copying the details manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Import from URL</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleScrape} className="p-5 space-y-4">
          <div>
            <label className="label">Opportunity URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-field"
              required
              placeholder="https://example.com/scholarship"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '🔍 Scraping...' : '🌐 Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

function formatDeadline(d) {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (diff < 0) return { label, urgent: false, expired: true };
  if (diff <= 7) return { label, urgent: true, expired: false };
  return { label, urgent: false, expired: false };
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'scrape'
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const load = async (q) => {
    setLoading(true);
    try {
      const data = await getOpportunities(q);
      setOpps(data);
    } catch {
      showToast('Failed to load opportunities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    load(q);
  };

  const handleSave = async (form) => {
    try {
      if (editing?.id) {
        const updated = await updateOpportunity(editing.id, form);
        setOpps(o => o.map(x => x.id === updated.id ? updated : x));
        showToast('Opportunity updated!');
      } else {
        const created = await createOpportunity(form);
        setOpps(o => [created, ...o]);
        showToast('Opportunity added!');
      }
      setModal(null);
      setEditing(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteOpportunity(id);
      setOpps(o => o.filter(x => x.id !== id));
      showToast('Deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleImport = (data) => {
    setEditing({ ...EMPTY_FORM, ...data });
    setModal('add');
  };

  const openEdit = (opp) => { setEditing(opp); setModal('edit'); };
  const openAdd = () => { setEditing(null); setModal('add'); };

  return (
    <div className="ml-64">
      <PageWrapper
        title="Opportunities"
        subtitle="Manage and browse all your saved opportunities"
        action={
          <div className="flex gap-2">
            <button onClick={() => setModal('scrape')} className="btn-secondary">🌐 Import from URL</button>
            <button onClick={openAdd} className="btn-primary">+ Add Opportunity</button>
          </div>
        }
      >
        {/* Search */}
        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search by title, type or description..."
            className="input-field max-w-sm"
          />
        </div>

        {loading ? (
          <LoadingSpinner text="Loading opportunities..." />
        ) : opps.length === 0 ? (
          <EmptyState
            icon="🗄️"
            title="No opportunities yet"
            description="Add an opportunity manually or import one from a URL"
            action={
              <div className="flex gap-2 justify-center">
                <button onClick={() => setModal('scrape')} className="btn-secondary px-5">Import from URL</button>
                <button onClick={openAdd} className="btn-primary px-5">Add Manually</button>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {opps.map(opp => {
              const dl = opp.deadline ? formatDeadline(opp.deadline) : null;
              return (
                <div key={opp.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{opp.title}</h3>
                        <Badge variant={typeColor(opp.opp_type)}>{opp.opp_type}</Badge>
                        {dl && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dl.expired ? 'bg-gray-100 text-gray-500' : dl.urgent ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {dl.expired ? 'Expired' : `Due ${dl.label}`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{opp.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => navigate('/match', { state: { opp } })}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        🎯 Check Match
                      </button>
                      <button onClick={() => openEdit(opp)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
                      <button
                        onClick={() => handleDelete(opp.id)}
                        disabled={deleting === opp.id}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors px-2"
                      >
                        {deleting === opp.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageWrapper>

      {(modal === 'add' || modal === 'edit') && (
        <OpportunityModal
          opp={editing}
          onSave={handleSave}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}
      {modal === 'scrape' && (
        <ScrapeModal
          onImport={handleImport}
          onClose={() => setModal(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
