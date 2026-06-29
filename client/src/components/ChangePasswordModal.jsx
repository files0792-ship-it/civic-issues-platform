import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from './Toast.jsx';

export default function ChangePasswordModal({ onClose }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef(null);

  // Focus first input on mount, trap scroll
  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/api/users/change-password', { currentPassword, newPassword });
      toast('Password updated successfully!', 'success');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-pw-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="change-pw-title" className="font-display text-lg font-bold text-slate-900">
            Change Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200" role="alert">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="cp-current" className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              id="cp-current"
              ref={firstInputRef}
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2 transition"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label htmlFor="cp-new" className="block text-sm font-medium text-slate-700 mb-1">
              New Password
              <span className="ml-1 text-xs font-normal text-slate-400">(min 6 characters)</span>
            </label>
            <input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2 transition"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="cp-confirm" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2 transition"
              placeholder="Re-enter new password"
            />
          </div>

          {/* Strength hint */}
          {newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    newPassword.length >= 10
                      ? 'bg-emerald-500 w-full'
                      : newPassword.length >= 8
                      ? 'bg-amber-400 w-2/3'
                      : newPassword.length >= 6
                      ? 'bg-orange-400 w-1/3'
                      : 'bg-red-400 w-1/6'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400">
                {newPassword.length >= 10
                  ? 'Strong password'
                  : newPassword.length >= 8
                  ? 'Good password'
                  : newPassword.length >= 6
                  ? 'Acceptable (could be stronger)'
                  : 'Too short'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-civic-600 py-2.5 text-sm font-semibold text-white hover:bg-civic-700 disabled:opacity-60 transition"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                'Save Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
