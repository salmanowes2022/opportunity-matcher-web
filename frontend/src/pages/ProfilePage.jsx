import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ProfileForm from '../components/profile/ProfileForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useProfile } from '../hooks/useProfile';
import { formatDate } from '../utils/scoreHelpers';

export default function ProfilePage() {
  const { profile, setProfile, loading } = useProfile();
  const { toast, showToast, hideToast } = useToast();
  const [editing, setEditing] = useState(false);

  const handleSaved = (saved) => {
    setProfile(saved);
    setEditing(false);
    showToast('Profile saved successfully!');
  };

  if (loading) return (
    <div className="p-8"><LoadingSpinner text="Loading profile..." /></div>
  );

  return (
    <div>
      <PageWrapper
        title="Mentorship Profile"
        subtitle="Your profile powers mentor matching first, then opportunity discovery and application support."
        action={profile && !editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
        )}
      >
        {(!profile || editing) ? (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2">{profile ? 'Edit Mentorship Profile' : 'Create Your Mentorship Profile'}</h2>
            <p className="text-sm text-gray-500 mb-5">
              Share your background, goals, and strengths so the platform can identify the right guidance relationships and recommend aligned opportunities.
            </p>
            <ProfileForm initialData={profile} onSaved={handleSaved} />
            {editing && (
              <button onClick={() => setEditing(false)} className="btn-secondary mt-3 w-full">Cancel</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
                  {profile.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-500">{profile.education_level} in {profile.field_of_study}</p>
                  {profile.gpa && <p className="text-sm text-gray-400">GPA: {profile.gpa}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">{s.trim()}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profile.languages) ? profile.languages : profile.languages.split(',')).map((l, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{l.trim()}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience</h3>
                  <p className="text-sm text-gray-700">{profile.experience_years} year{profile.experience_years !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Member since</h3>
                  <p className="text-sm text-gray-700">{formatDate(profile.created_at)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Achievements</h3>
                  <p className="text-sm text-gray-700">{profile.achievements}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Mentorship Goals</h3>
                  <p className="text-sm text-gray-700">{profile.goals}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
