import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types';
import { authApi } from '../api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  demoLogin: (role: 'designer' | 'reviewer') => Promise<void>;
  logout: () => void;
  register: (data: { username: string; email: string; password: string; full_name?: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('sketch2park_token');
    const userStr = localStorage.getItem('sketch2park_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('sketch2park_token');
        localStorage.removeItem('sketch2park_user');
      }
    }
  }, []);

  const setAuth = useCallback((user: User, token: string) => {
    localStorage.setItem('sketch2park_token', token);
    localStorage.setItem('sketch2park_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    setAuth(res.user, res.access_token);
  }, [setAuth]);

  const demoLogin = useCallback(async (role: 'designer' | 'reviewer') => {
    const res = await authApi.demoLogin(role);
    setAuth(res.user, res.access_token);
  }, [setAuth]);

  const register = useCallback(async (data: { username: string; email: string; password: string; full_name?: string; role: string }) => {
    const res = await authApi.register(data);
    setAuth(res.user, res.access_token);
  }, [setAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('sketch2park_token');
    localStorage.removeItem('sketch2park_user');
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, demoLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
