import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleAuthSection } from '../components/GoogleSignInButton.jsx';

export default function Login() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [governmentAuthId, setGovernmentAuthId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (role === 'admin' && !governmentAuthId.trim()) {
      setError('Government Auth ID is required for admin login.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { email, password, role };
      if (role === 'admin') {
        payload.governmentAuthId = governmentAuthId.trim();
      }

      const { data } = await api.post('/api/auth/login', payload);
      setToken(data.token);
      localStorage.setItem('role', data.user.role);

      if (data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-2 text-slate-600">Sign in to report issues and upvote.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">
              Login as
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== 'admin') setGovernmentAuthId('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
            />
          </div>

          {role === 'admin' && (
            <div>
              <label htmlFor="governmentAuthId" className="block text-sm font-medium text-slate-700">
                Government Auth ID
              </label>
              <input
                id="governmentAuthId"
                type="text"
                required
                value={governmentAuthId}
                onChange={(e) => setGovernmentAuthId(e.target.value)}
                placeholder="Enter Government Authentication ID"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                This ID is required for administrator authentication.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-civic-600 py-3 font-semibold text-white hover:bg-civic-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <GoogleAuthSection redirectTo={from} onError={setError} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{' '}
        <Link to="/register" className="font-medium text-civic-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
