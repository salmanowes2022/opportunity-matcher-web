import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { generateMaterial, getMaterials, deleteMaterial, exportMaterial } from '../api/materials.api';

const TYPES = [
  { key: 'cover_letter', label: 'Cover Letter', icon: '📝' },
  { key: 'personal_statement', label: 'Personal Statement', icon: '📖' },
  { key: 'motivation_letter', label: 'Motivation Letter', icon: '💌' },
];
const OPP_TYPES = ['Scholarship', 'Fellowship', 'Job', 'Academic Program', 'Internship', 'Other'];

export default function MaterialsPage() {
  const [tab, setTab] = useState('generate');
  const [type, setType] = useState('cover_letter');
  const [opp, setOpp] = useState({ title: '', opp_type: 'Scholarship', description: '', requirements: '' });
  const [wordCount, setWordCount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [saved, setSaved] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (tab === 'saved') {
      setListLoading(true);
      getMaterials().then(setSaved).finally(() => setListLoading(false));
    }
  }, [tab]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGenerated(null);
    try {
      const mat = await generateMaterial({ material_type: type, opportunity: opp, target_word_count: wordCount });
      setGenerated(mat);
      showToast('Material generated and saved!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id, format) => {
    try {
      const blob = await exportMaterial(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `material_${id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="ml-64">
      <PageWrapper title="Generate Materials" subtitle="AI-powered cover letters, personal statements, and motivation letters">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('generate')} className={tab === 'generate' ? 'btn-primary' : 'btn-secondary'}>✍️ Generate</button>
          <button onClick={() => setTab('saved')} className={tab === 'saved' ? 'btn-primary' : 'btn-secondary'}>📁 Saved Materials</button>
        </div>

        {tab === 'generate' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
              <div>
                <label className="label">Material Type</label>
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button key={t.key} onClick={() => setType(t.key)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${type === t.key ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="label">Opportunity Title *</label>
                  <input value={opp.title} onChange={e => setOpp(o => ({ ...o, title: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={opp.opp_type} onChange={e => setOpp(o => ({ ...o, opp_type: e.target.value }))} className="input-field">
                    {OPP_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea value={opp.description} onChange={e => setOpp(o => ({ ...o, description: e.target.value }))} className="input-field" rows={3} required />
                </div>
                <div>
                  <label className="label">Requirements *</label>
                  <textarea value={opp.requirements} onChange={e => setOpp(o => ({ ...o, requirements: e.target.value }))} className="input-field" rows={3} required />
                </div>
                <div>
                  <label className="label">Target Word Count: {wordCount}</label>
                  <input type="range" min={200} max={1000} step={50} value={wordCount} onChange={e => setWordCount(Number(e.target.value))} className="w-full" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Generating...' : '✨ Generate Material'}
                </button>
              </form>
            </div>

            <div>
              {loading && <LoadingSpinner text="AI is writing your material..." />}
              {generated && !loading && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{generated.word_count} words</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopy(generated.content)} className="btn-secondary text-xs px-3 py-1">📋 Copy</button>
                      <button onClick={() => handleExport(generated.id, 'pdf')} className="btn-secondary text-xs px-3 py-1">📄 PDF</button>
                      <button onClick={() => handleExport(generated.id, 'txt')} className="btn-secondary text-xs px-3 py-1">📝 TXT</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{generated.content}</pre>
                  </div>
                  {generated.key_points_highlighted?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {generated.key_points_highlighted.map((p, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'saved' && (
          listLoading ? <LoadingSpinner /> :
          saved.length === 0 ? <EmptyState icon="📁" title="No saved materials" description="Generate your first material above" /> :
          <div className="space-y-3">
            {saved.map(mat => (
              <div key={mat.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{mat.opportunity_title || 'Untitled'}</p>
                  <p className="text-xs text-gray-400 capitalize">{mat.material_type?.replace(/_/g, ' ')} • {mat.word_count} words</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport(mat.id, 'pdf')} className="btn-secondary text-xs px-3 py-1">PDF</button>
                  <button onClick={() => handleExport(mat.id, 'txt')} className="btn-secondary text-xs px-3 py-1">TXT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
