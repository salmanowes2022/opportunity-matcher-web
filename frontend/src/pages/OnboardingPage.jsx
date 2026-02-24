import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument, extractProfile } from '../api/documents.api';
import { saveProfile } from '../api/profile.api';

const OPP_TYPES = ['Scholarship', 'Fellowship', 'Job', 'Academic Program', 'Internship'];

const STEPS = [
  { id: 1, icon: '👋', title: 'Welcome', subtitle: 'Let\'s get you set up in 3 simple steps' },
  { id: 2, icon: '📄', title: 'Upload Your CV', subtitle: 'We\'ll extract your profile automatically' },
  { id: 3, icon: '🎯', title: 'Your Goals', subtitle: 'What kind of opportunities are you looking for?' },
];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`flex items-center gap-2 ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s.id ? '✓' : s.id}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === s.id ? 'text-primary-700' : 'text-gray-400'}`}>{s.title}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 transition-all ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepWelcome({ onNext }) {
  return (
    <div className="text-center py-6">
      <div className="text-6xl mb-4">🎯</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Opportunity Matcher!</h2>
      <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
        We'll help you find scholarships, fellowships, jobs, and academic programs perfectly matched to your profile.
        Setup takes less than 2 minutes.
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
        {[
          { icon: '📄', label: 'Upload CV', desc: 'Auto-extract your profile' },
          { icon: '🎯', label: 'AI Matching', desc: 'Score any opportunity instantly' },
          { icon: '✍️', label: 'AI Writing', desc: 'Cover letters & statements' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm font-semibold text-primary-800">{label}</p>
            <p className="text-[11px] text-primary-600 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="btn-primary px-10 py-3 text-base">
        Get Started →
      </button>
    </div>
  );
}

function StepCV({ onNext, onSkip }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      // Step 1: analyze document
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', 'cv');
      const analysis = await analyzeDocument(formData);

      // Step 2: extract profile fields
      const profileUpdates = await extractProfile({ analysis });

      // Step 3: save profile
      if (profileUpdates && Object.keys(profileUpdates).length > 0) {
        await saveProfile(profileUpdates);
        setExtracted(true);
        setTimeout(() => onNext(), 1500);
      } else {
        setError('Could not extract enough info from your CV. You can fill your profile manually.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try a different file or skip to fill manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={`border-2 border-dashed rounded-2xl p-10 text-center mb-5 transition-colors ${
        file ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={e => { setFile(e.target.files[0]); setError(''); }}
          className="hidden"
          id="cv-upload"
        />
        <label htmlFor="cv-upload" className="cursor-pointer">
          {file ? (
            <div>
              <div className="text-4xl mb-2">📄</div>
              <p className="font-semibold text-primary-700">{file.name}</p>
              <p className="text-xs text-primary-500 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📁</div>
              <p className="font-semibold text-gray-700">Drop your CV here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, or Image · Max 10MB</p>
            </div>
          )}
        </label>
      </div>

      {extracted && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 mb-4 text-center">
          <p className="text-green-700 font-semibold">✅ Profile created from your CV!</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="btn-secondary flex-1"
        >
          Skip — Fill manually
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary flex-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Extracting…
            </span>
          ) : '📤 Upload & Extract'}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3">Your CV is processed securely and never stored</p>
    </div>
  );
}

function StepGoals({ onFinish }) {
  const [form, setForm] = useState({
    primary_goal: '',
    preferred_types: [],
    target_countries: '',
    name: '',
  });
  const [saving, setSaving] = useState(false);

  const toggleType = (t) => {
    setForm(f => ({
      ...f,
      preferred_types: f.preferred_types.includes(t)
        ? f.preferred_types.filter(x => x !== t)
        : [...f.preferred_types, t]
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    // Save a lightweight preferences note to profile goals field if they filled anything
    // This is supplementary data — main profile is filled via CV or /profile page
    onFinish();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="label">What's your name? *</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="input-field"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="label">What types of opportunities are you seeking?</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {OPP_TYPES.map(t => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
                form.preferred_types.includes(t)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Primary goal</label>
        <textarea
          value={form.primary_goal}
          onChange={e => setForm(f => ({ ...f, primary_goal: e.target.value }))}
          className="input-field"
          rows={3}
          placeholder="e.g., I'm looking for fully-funded PhD programs in Computer Science in Europe, or scholarship programs to study abroad..."
        />
      </div>

      <div>
        <label className="label">Target countries / regions</label>
        <input
          value={form.target_countries}
          onChange={e => setForm(f => ({ ...f, target_countries: e.target.value }))}
          className="input-field"
          placeholder="e.g., USA, UK, Germany, Any"
        />
      </div>

      <button
        onClick={handleFinish}
        disabled={saving}
        className="btn-primary w-full py-3 text-base"
      >
        {saving ? 'Setting up…' : '🚀 Go to Dashboard'}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleFinish = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <ProgressBar step={step} />

        {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepCV
            onNext={() => setStep(3)}
            onSkip={() => setStep(3)}
          />
        )}
        {step === 3 && <StepGoals onFinish={handleFinish} />}
      </div>
    </div>
  );
}
