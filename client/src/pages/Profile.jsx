import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';
import { api } from '../api/client.js';
import { isFirebaseConfigured } from '../config/firebase.js';
import { getGoogleAuthErrorMessage, getGoogleIdToken } from '../utils/googleAuth.js';
import { User, Mail, Lock, LogOut, Shield, CheckCircle, X } from 'lucide-react';

/** Generates initials (up to 2 chars) from a display name */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Deterministic hue from name */
function nameToHue(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % 360;
}

function Avatar({ user, size = 'lg' }) {
  const initials = getInitials(user?.name);
  const hue = nameToHue(user?.name);
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-12 w-12 text-base';

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full object-cover ring-4 ring-white shadow-md`}
      />
    );
  }
  return (
    <span
      className={`${sizeClass} flex items-center justify-center rounded-full font-bold text-white ring-4 ring-white shadow-md select-none`}
      style={{ background: `hsl(${hue} 60% 45%)` }}
    >
      {initials}
    </span>
  );
}

function InfoRow({ label, value, masked, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {Icon && <Icon size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-sm text-slate-900 dark:text-white font-medium tracking-wide">
        {masked ? '••••••••' : value}
      </span>
    </div>
  );
}

function ProviderBadge({ connected }) {
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 dark:bg-success-900/30 px-3 py-1 text-xs font-semibold text-success-700 dark:text-success-300 border border-success-200 dark:border-success-500/30">
        <CheckCircle size={12} />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
      <X size={12} />
      Not Connected
    </span>
  );
}

function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const isGoogleConnected =
    user?.authProvider === 'google' || user?.authProvider === 'linked';
  const isLocalAccount = user?.authProvider === 'local' || user?.authProvider === 'linked';
  const isGoogleOnly = user?.authProvider === 'google';

  async function handleSyncGoogle() {
    if (linkingGoogle) return;
    setLinkingGoogle(true);
    try {
      if (!isFirebaseConfigured()) {
        toast('Google Sign-In is not configured on this server.', 'error');
        return;
      }
      const idToken = await getGoogleIdToken();
      const { data } = await api.post('/api/auth/google/link', { idToken });
      setUser(data.user);
      toast('Google account linked successfully!', 'success');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        getGoogleAuthErrorMessage(err) ||
        'Failed to link Google account.';
      toast(message, 'error');
    } finally {
      setLinkingGoogle(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-6 pb-16">
        {/* Page header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Manage your account settings and preferences.</p>
        </div>

        {/* Profile header card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar user={user} size="lg" />
            <div className="text-center sm:text-left">
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/30 capitalize">
                  <Shield size={12} />
                  {user.role}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 capitalize">
                  {user.authProvider === 'linked'
                    ? 'Email + Google'
                    : user.authProvider === 'google'
                    ? 'Google Account'
                    : 'Email Account'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
            <h2 className="font-display text-base font-bold text-slate-800 dark:text-white">Account Information</h2>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="Full Name" value={user.name} icon={User} />
            <InfoRow label="Email Address" value={user.email} icon={Mail} />
            <InfoRow label="Password" value="••••••••" masked icon={Lock} />
          </div>
          {/* Change password — only for local/linked accounts */}
          {!isGoogleOnly && (
            <div className="px-6 pb-5 pt-2">
              <button
                id="change-password-btn"
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition"
              >
                <Lock size={16} className="text-slate-500 dark:text-slate-400" />
                Change Password
              </button>
            </div>
          )}
        </div>

        {/* Google Account card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
            <h2 className="font-display text-base font-bold text-slate-800 dark:text-white">Google Account</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                  <GoogleLogo />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Google</p>
                  <div className="mt-0.5">
                    <ProviderBadge connected={isGoogleConnected} />
                  </div>
                </div>
              </div>

              {!isGoogleConnected && (
                <button
                  id="sync-google-btn"
                  type="button"
                  onClick={handleSyncGoogle}
                  disabled={linkingGoogle}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  {linkingGoogle ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-500 border-t-slate-700 dark:border-t-slate-300" />
                      Linking…
                    </>
                  ) : (
                    <>
                      <GoogleLogo />
                      Sync with Google
                    </>
                  )}
                </button>
              )}
            </div>
            {isGoogleConnected && (
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                Your account is linked to Google. You can sign in with either email/password or Google.
              </p>
            )}
          </div>
        </div>

        {/* Danger zone — Logout */}
        <div className="rounded-2xl border border-danger-200 dark:border-danger-800 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-danger-100 dark:border-danger-900 bg-danger-50/40 dark:bg-danger-900/20">
            <h2 className="font-display text-base font-bold text-danger-700 dark:text-danger-400">Danger Zone</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Logging out will clear your session. You'll need to sign in again to access your account.
            </p>
            {!logoutConfirm ? (
              <button
                id="logout-btn"
                type="button"
                onClick={() => setLogoutConfirm(true)}
                className="w-full rounded-xl bg-danger-600 py-3 text-sm font-semibold text-white hover:bg-danger-700 active:bg-danger-800 transition shadow-sm shadow-danger-600/25 flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Log Out
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-danger-700 dark:text-danger-400 text-center">
                  Are you sure you want to log out?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutConfirm(false)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="logout-confirm-btn"
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-xl bg-danger-600 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 transition shadow-sm shadow-danger-600/25"
                  >
                    Yes, Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
}
