import React, { useState } from 'react';
import { saveProfile } from '../../api/profile.api';

const EDUCATION_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Other"];

export default function ProfileForm({ initialData = null, onSaved }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    education_level: initialData?.education_level || "Bachelor's",
    field_of_study: initialData?.field_of_study || '',
    gpa: initialData?.gpa || '',
    skills: initialData?.skills || '',
    experience_years: initialData?.experience_years ?? 0,
    languages: initialData?.languages || '',
    achievements: initialData?.achievements || '',
    goals: initialData?.goals || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        gpa: form.gpa ? Number(form.gpa) : null,
        experience_years: Number(form.experience_years),
      };
      const profile = await saveProfile(payload);
      onSaved(profile);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="label">Education Level *</label>
          <select name="education_level" value={form.education_level} onChange={handleChange} className="input-field">
            {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Field of Study *</label>
          <input name="field_of_study" value={form.field_of_study} onChange={handleChange} className="input-field" required placeholder="e.g., Computer Science" />
        </div>
        <div>
          <label className="label">GPA (optional, 0-4.0)</label>
          <input type="number" name="gpa" value={form.gpa} onChange={handleChange} className="input-field" min="0" max="4" step="0.01" placeholder="e.g., 3.8" />
        </div>
        <div>
          <label className="label">Years of Experience *</label>
          <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} className="input-field" min="0" required />
        </div>
        <div>
          <label className="label">Languages *</label>
          <input name="languages" value={form.languages} onChange={handleChange} className="input-field" required placeholder="English, Arabic, French" />
        </div>
      </div>

      <div>
        <label className="label">Skills *</label>
        <textarea name="skills" value={form.skills} onChange={handleChange} className="input-field" rows={3} required placeholder="Python, Data Analysis, Research, Project Management..." />
      </div>
      <div>
        <label className="label">Key Achievements *</label>
        <textarea name="achievements" value={form.achievements} onChange={handleChange} className="input-field" rows={3} required placeholder="Awards, publications, certifications, notable projects..." />
      </div>
      <div>
        <label className="label">Your Goals *</label>
        <textarea name="goals" value={form.goals} onChange={handleChange} className="input-field" rows={3} required placeholder="What are you looking for? Career change, PhD, research opportunities..." />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? 'Saving...' : '💾 Save Profile'}
      </button>
    </form>
  );
}
