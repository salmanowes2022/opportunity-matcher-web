import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { analyzeDocument, extractProfile } from '../api/documents.api';
import { saveProfile } from '../api/profile.api';

const DOC_TYPES = ['cv', 'transcript', 'certificate', 'other'];

export default function DocumentsPage() {
  const [docType, setDocType] = useState('cv');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setAnalysis(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('document_type_hint', docType);
      const result = await analyzeDocument(fd);
      setAnalysis(result);
    } catch (err) {
      showToast(err.response?.data?.error || 'Analysis failed', 'error');
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
      showToast('Profile created from document!');
    } catch {
      showToast('Failed to create profile', 'error');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="ml-64">
      <PageWrapper title="Upload Documents" subtitle="Upload CVs, transcripts, or certificates to extract information">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card p-4">
              <label className="label">Document Type</label>
              <div className="flex gap-2">
                {DOC_TYPES.map(t => (
                  <button key={t} onClick={() => setDocType(t)}
                    className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${docType === t ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div {...getRootProps()} className={`card p-8 text-center cursor-pointer border-2 border-dashed transition-colors ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}`}>
              <input {...getInputProps()} />
              <div className="text-4xl mb-3">📎</div>
              <p className="text-sm text-gray-600 font-medium">{isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, or PDF up to 10MB</p>
            </div>
            {preview && <img src={preview} alt="Document preview" className="rounded-lg border border-gray-200 max-h-48 object-contain w-full" />}
            {loading && <LoadingSpinner text="Analyzing document..." />}
          </div>

          <div>
            {analysis && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Analysis Result</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {(analysis.confidence_score * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Document Type</p>
                  <p className="text-sm text-gray-800 capitalize">{analysis.document_type}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-500 mb-1">Extracted Text</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{analysis.extracted_text}</pre>
                </div>
                {Object.keys(analysis.key_information).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Key Information</p>
                    <div className="space-y-1">
                      {Object.entries(analysis.key_information).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-sm">
                          <span className="font-medium text-gray-600 capitalize">{k}:</span>
                          <span className="text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleCreateProfile} disabled={extracting} className="btn-primary w-full py-2.5">
                  {extracting ? 'Creating...' : '⚡ Create Profile from this Document'}
                </button>
              </div>
            )}
            {!analysis && !loading && (
              <div className="card p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-500 font-medium">Upload a document to see analysis</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
