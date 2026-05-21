import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then((res) => setUser(res.data.data.user))
      .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: u, accessToken } = res.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { user: u, accessToken } = res.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
