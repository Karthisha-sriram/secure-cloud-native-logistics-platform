import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Shield, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User as UserType } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [language, setLanguage] = useState('en-US');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProfile();
        setProfile(data);
        setName(data.name);
        setPhone(data.phone);
        setCompany(data.company);
        setAvatarUrl(data.avatarUrl);
        setEmailAlerts(data.preferences?.emailAlerts ?? true);
        setSmsAlerts(data.preferences?.smsAlerts ?? false);
        setLanguage(data.preferences?.language ?? 'en-US');
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        avatarUrl: avatarUrl.trim(),
        preferences: {
          theme: profile?.preferences?.theme || 'light',
          emailAlerts,
          smsAlerts,
          language,
        },
      });
      setProfile(updated);
      setSuccessMessage('Profile settings saved successfully to Cloud database.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        <span>Retrieving account profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 font-display">
          User Account Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal dispatch identity, direct contact channels, and system alerts
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-5">
        <img
          src={avatarUrl || profile?.avatarUrl}
          alt={name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-base font-bold text-slate-900">{profile?.name}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {profile?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500">{profile?.email} • {profile?.company}</p>
          <div className="text-[11px] text-slate-400 pt-1">
            Registered: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'} • Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
            Contact & Identity Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Corporate Email (Fixed)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Direct Phone
              </label>
              <input
                id="profile-phone-input"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Company / Department
              </label>
              <input
                id="profile-company-input"
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Avatar Image URL
              </label>
              <input
                id="profile-avatar-input"
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
            Notification & Language Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">Receive email alerts for status changes and delays</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">Receive SMS notifications for high-priority exceptions</span>
            </label>

            <div className="max-w-xs pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Operational Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
              >
                <option value="en-US">English (United States)</option>
                <option value="de-DE">Deutsch (Germany)</option>
                <option value="fr-FR">Français (France)</option>
                <option value="ja-JP">日本語 (Japan)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            id="profile-save-btn"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
