import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'civic_token';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setToken = (t) => {
    if (t) localStorage.setItem(STORAGE_KEY, t);
    else localStorage.removeItem(STORAGE_KEY);
    setTokenState(t);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('role');
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === 'admin',
      setToken,
      logout,
      setUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
