import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService.js';
import { SESSION_KEY, UNAUTHORIZED_EVENT } from '../services/api.js';

const AuthContext = createContext(null);

function loadSession() {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY));
    return data?.token ? data : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const saveSession = useCallback((data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const setUser = useCallback((user) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const refreshUser = useCallback(async () => {
    if (!loadSession()) return;
    try {
      setUser(await authService.getMe());
    } catch (err) {
      if (err.status === 403) logout();
    }
  }, [setUser, logout]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    saveSession(data);
    return data.user;
  };

  const updateUser = async (changes) => {
    setUser(await authService.updateProfile(changes));
  };

  const value = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session),
    isAdmin: session?.user?.role === 'admin',
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
