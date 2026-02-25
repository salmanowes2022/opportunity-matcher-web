import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { getOpportunities } from '../api/opportunities.api';
import { generatePackage, listPackages, getPackage, deletePackage } from '../api/smartApply.api';

// ─── Tab component ───────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-xs text-gray-400 hover:text-primary-600 transition-colors ml-2">
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon, children, extra }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {extra}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-100 p-4">{children}</div>}
    </div>
  );
}

// ─── Document checklist ───────────────────────────────────────────────────────
function DocChecklist({ items }) {
  const statusMeta = {
    have_it:          { label: 'Have it',          cls: 'bg-green-100 text-green-700' },
    need_to_prepare:  { label: 'Need to prepare',  cls: 'bg-amber-100 text-amber-700' },
    optional:         { label: 'Optional',         cls: 'bg-gray-100 text-gray-500'  }
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const meta = statusMeta[item.status] || statusMeta.optional;
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <span className="text-base mt-0.5">{item.required ? '📄' : '📎'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-900">{item.document}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                {item.required && <span className="text-[11px] text-red-500 font-semibold">Required</span>}
              </div>
              {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Short answers ────────────────────────────────────────────────────────────
function ShortAnswers({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{item.question}</p>
            <span className="text-xs text-gray-400">{item.word_count}w</span>
          </div>
          <div className="p-4 flex items-start gap-2">
            <p className="text-sm text-gray-700 flex-1 whitespace-pre-wrap">{item.answer}</p>
            <CopyButton text={item.answer} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Package viewer ───────────────────────────────────────────────────────────
function PackageViewer({ pkg, opportunityTitle, onClose }) {
  const tabs = ['cover_letter', 'personal_statement', 'short_answers', 'documents', 'tips'];
  const tabLabels = { cover_letter: '✉️ Cover Letter', personal_statement: '📖 Personal Statement', short_answers: '💬 Short Answers', documents: '📋 Checklist', tips: '💡 Tips' };
  const [activeTab, setActiveTab] = useState('cover_letter');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚡</span>
              <h2 className="font-bold text-gray-900">Smart Apply Package</h2>
            </div>
            <p className="text-sm text-gray-500">{opportunityTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
              {pkg.estimated_prep_time}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">&times;</button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <Tab key={t} label={tabLabels[t]} active={activeTab === t} onClick={() => setActiveTab(t)} />
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'cover_letter' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Cover Letter</h4>
                <CopyButton text={pkg.cover_letter} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono border border-gray-100">
                {pkg.cover_letter}
              </div>
            </div>
          )}

          {activeTab === 'personal_statement' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Personal Statement</h4>
                <CopyButton text={pkg.personal_statement} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                {pkg.personal_statement}
              </div>
            </div>
          )}

          {activeTab === 'short_answers' && (
            <ShortAnswers items={pkg.short_answers} />
          )}

          {activeTab === 'documents' && (
            <DocChecklist items={pkg.document_checklist} />
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              {pkg.submission_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-blue-500 font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-blue-800">{tip}</p>
                </div>
              ))}
              {pkg.tailoring_notes && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Tailoring Notes</p>
                  <p className="text-sm text-amber-800">{pkg.tailoring_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SmartApplyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [opps, setOpps] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(location.state?.opp || null);
  const [generating, setGenerating] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  const [savedPackages, setSavedPackages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [view, setView] = useState('generate'); // 'generate' | 'history'
  const [loadingPkg, setLoadingPkg] = useState(null);

  // Load opportunities for selector
  useEffect(() => {
    getOpportunities().then(setOpps).catch(() => {});
  }, []);

  // Load saved packages
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const list = await listPackages();
      setSavedPackages(list || []);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleGenerate = async () => {
    if (!selectedOpp) return;
    setGenerating(true);
    try {
      const { package: pkg } = await generatePackage(selectedOpp);
      setActivePackage({ pkg, title: selectedOpp.title });
      await loadHistory(); // refresh saved list
      showToast('Application package generated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Generation failed. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewSaved = async (id) => {
    setLoadingPkg(id);
    try {
      const pkg = await getPackage(id);
      setActivePackage({ pkg, title: pkg.opportunity_title });
    } catch {
      showToast('Failed to load package', 'error');
    } finally {
      setLoadingPkg(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
      setSavedPackages(p => p.filter(x => x.id !== id));
      showToast('Deleted');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const profilePct = selectedOpp ? 100 : 0;

  return (
    <div>
      <PageWrapper
        title="Smart Apply"
        subtitle="One-click full application package powered by AI"
        action={
          <div className="flex gap-2">
            <Tab label="Generate" active={view === 'generate'} onClick={() => setView('generate')} />
            <Tab label={`History ${savedPackages.length > 0 ? `(${savedPackages.length})` : ''}`} active={view === 'history'} onClick={() => setView('history')} />
          </div>
        }
      >
        {view === 'generate' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Info banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">What you get in one click:</p>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {['✉️ Cover Letter', '📖 Personal Statement', '💬 Short Answer Responses', '📋 Document Checklist', '💡 Submission Tips', '🎯 Tailoring Notes'].map(item => (
                      <p key={item} className="text-xs text-gray-600">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunity selector */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Select Opportunity</h3>
              {opps.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No saved opportunities yet.</p>
                  <button onClick={() => navigate('/opportunities')} className="btn-primary text-sm">
                    + Add Opportunities
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {opps.map(opp => (
                    <button
                      key={opp.id}
                      onClick={() => setSelectedOpp(opp)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedOpp?.id === opp.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{opp.opp_type}{opp.provider ? ` · ${opp.provider}` : ''}</p>
                        </div>
                        {selectedOpp?.id === opp.id && (
                          <span className="text-primary-500 text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected preview + generate */}
            {selectedOpp && (
              <div className="card p-5 border-2 border-primary-200 bg-primary-50/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Selected</p>
                    <h4 className="font-bold text-gray-900">{selectedOpp.title}</h4>
                    <p className="text-sm text-gray-500">{selectedOpp.opp_type}{selectedOpp.provider ? ` · ${selectedOpp.provider}` : ''}</p>
                  </div>
                  <button onClick={() => setSelectedOpp(null)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{selectedOpp.description}</p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Generating your package… (15–30s)
                    </>
                  ) : (
                    <>⚡ Generate Full Application Package</>
                  )}
                </button>
                {generating && (
                  <p className="text-xs text-center text-gray-400 mt-2">AI is crafting your personalized materials — please wait</p>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div>
            {loadingHistory ? (
              <LoadingSpinner text="Loading packages…" />
            ) : savedPackages.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">⚡</p>
                <p className="font-semibold text-gray-700">No packages yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Generate your first Smart Apply package above</p>
                <button onClick={() => setView('generate')} className="btn-primary text-sm">Generate Package</button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPackages.map(item => (
                  <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.opportunity_title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.estimated_prep_time} · {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleViewSaved(item.id)}
                        disabled={loadingPkg === item.id}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        {loadingPkg === item.id ? '…' : '👁 View'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageWrapper>

      {/* Package viewer modal */}
      {activePackage && (
        <PackageViewer
          pkg={activePackage.pkg}
          opportunityTitle={activePackage.title}
          onClose={() => setActivePackage(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
