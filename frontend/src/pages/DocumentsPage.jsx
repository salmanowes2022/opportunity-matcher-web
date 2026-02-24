import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { analyzeDocument, extractProfile } from '../api/documents.api';
import { saveProfile } from '../api/profile.api';

const DOC_TYPES = [
  { id: 'cv', label: 'CV / Resume', icon: '👤' },
  { id: 'transcript', label: 'Transcript', icon: '🎓' },
  { id: 'certificate', label: 'Certificate', icon: '📜' },
  { id: 'other', label: 'Other', icon: '📁' },
];

const RESULT_TABS = ['Overview', 'Extracted Text', 'Key Info'];

function formatValue(val) {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map((item, i) =>
      typeof item === 'object' ? (
        <div key={i} className="mb-2 pl-3 border-l-2 border-gray-200">
          {Object.entries(item).map(([k, v]) => (
            <div key={k} className="flex gap-1 text-xs">
              <span className="font-medium text-gray-500 capitalize min-w-[80px]">{k}:</span>
              <span className="text-gray-700">{String(v)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div key={i} className="text-xs text-gray-700">• {String(item)}</div>
      )
    );
  }
  if (typeof val === 'object' && val !== null) {
    return (
      <div className="space-y-1">
        {Object.entries(val).map(([k, v]) => (
          <div key={k} className="flex gap-1 text-xs">
            <span className="font-medium text-gray-500 capitalize min-w-[80px]">{k}:</span>
            <span className="text-gray-700">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return String(val);
}

function ConfidenceBadge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-green-100 text-green-700 border-green-200'
    : pct >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-red-100 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {pct}% confidence
    </span>
  );
}

export default function DocumentsPage() {
  const [docType, setDocType] = useState('cv');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const { toast, showToast, hideToast } = useToast();

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFileType(file.type);
    setFileName(file.name);
    setLoading(true);
    setAnalysis(null);
    setProfileCreated(false);
    setActiveTab('Overview');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('document_type_hint', docType);
      const result = await analyzeDocument(fd);
      setAnalysis(result);
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [docType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1
  });

  const handleCreateProfile = async () => {
    if (!analysis) return;
    setExtracting(true);
    try {
      const suggested = await extractProfile({ extracted_text: analysis.extracted_text });
      const cleaned = Object.fromEntries(Object.entries(suggested).filter(([, v]) => v !== null && v !== undefined));
      if (Object.keys(cleaned).length === 0) { showToast('Could not extract profile data', 'error'); return; }
      await saveProfile({
        name: cleaned.name || 'From CV',
        education_level: cleaned.education_level || "Bachelor's",
        field_of_study: cleaned.field_of_study || 'Not specified',
        gpa: cleaned.gpa || null,
        skills: cleaned.skills || 'Not specified',
        experience_years: cleaned.experience_years || 0,
        languages: cleaned.languages || 'English',
        achievements: cleaned.achievements || 'See CV for details',
        goals: cleaned.goals || 'See CV for details',
      });
      setProfileCreated(true);
      showToast('Profile created from document!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to create profile', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const keyInfoEntries = analysis ? Object.entries(analysis.key_information) : [];

  return (
    <div className="ml-64">
      <PageWrapper title="Upload Documents" subtitle="Upload CVs, transcripts, or certificates to extract your profile automatically">
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Left panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Doc type selector */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Document Type</p>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map(t => (
                  <button key={t.id} onClick={() => setDocType(t.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      docType === t.id
                        ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone */}
            <div {...getRootProps()}
              className={`card p-8 text-center cursor-pointer border-2 border-dashed transition-all ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
              }`}>
              <input {...getInputProps()} />
              <div className="text-4xl mb-3">{isDragActive ? '⬇️' : '☁️'}</div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragActive ? 'Release to upload' : 'Drag & drop your document'}
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-300 mt-3">JPEG · PNG · WebP · PDF · Max 10MB</p>
            </div>

            {/* File preview */}
            {preview && !loading && (
              <div className="card overflow-hidden">
                {fileType === 'application/pdf' ? (
                  <div className="p-4 flex items-center gap-3 bg-red-50">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">📄</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{fileName}</p>
                      <p className="text-xs text-gray-400">PDF Document</p>
                    </div>
                    {analysis && <span className="ml-auto text-green-500 text-lg">✓</span>}
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-44 object-cover" />
                )}
              </div>
            )}

            {loading && (
              <div className="card p-6">
                <LoadingSpinner text="Analyzing document with AI..." />
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="lg:col-span-3">
            {!analysis && !loading && (
              <div className="card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">📋</div>
                <p className="font-semibold text-gray-700 mb-1">No document uploaded yet</p>
                <p className="text-sm text-gray-400">Upload a CV, transcript or certificate on the left to see AI-powered analysis here</p>
              </div>
            )}

            {analysis && (
              <div className="card overflow-hidden">
                {/* Result header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Analysis Complete</p>
                    <h3 className="font-semibold text-gray-800 mt-0.5">{analysis.document_type}</h3>
                  </div>
                  <ConfidenceBadge score={analysis.confidence_score} />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                  {RESULT_TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>
                      {tab}
                      {tab === 'Key Info' && keyInfoEntries.length > 0 && (
                        <span className="ml-1.5 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                          {keyInfoEntries.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6">

                  {/* Overview tab */}
                  {activeTab === 'Overview' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-400 font-medium mb-1">Document Type</p>
                          <p className="text-sm font-semibold text-gray-800">{analysis.document_type}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-400 font-medium mb-1">Fields Detected</p>
                          <p className="text-sm font-semibold text-gray-800">{keyInfoEntries.length} fields</p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-xs font-semibold text-blue-600 mb-1.5">💡 Suggestions</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{analysis.suggestions}</p>
                      </div>

                      {/* Create profile button */}
                      {profileCreated ? (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <div>
                            <p className="font-semibold text-green-800 text-sm">Profile created successfully!</p>
                            <p className="text-xs text-green-600">Your profile has been updated from this document.</p>
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleCreateProfile} disabled={extracting}
                          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                          {extracting ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Extracting profile data...
                            </>
                          ) : (
                            <><span>⚡</span> Create Profile from this Document</>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Extracted Text tab */}
                  {activeTab === 'Extracted Text' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-400 font-medium">Full text extracted by AI</p>
                        <span className="text-xs text-gray-300">{analysis.extracted_text.length} characters</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-100">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {analysis.extracted_text}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Key Info tab */}
                  {activeTab === 'Key Info' && (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {keyInfoEntries.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No key information extracted</p>
                      ) : keyInfoEntries.map(([key, val]) => {
                        // Try to parse stringified JSON back for display
                        let displayVal = val;
                        if (typeof val === 'string') {
                          try { displayVal = JSON.parse(val); } catch { displayVal = val; }
                        }
                        return (
                          <div key={key} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {formatValue(displayVal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
