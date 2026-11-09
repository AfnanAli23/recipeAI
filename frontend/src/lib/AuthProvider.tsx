'use client'; // uses useState/useEffect/localStorage -> must run in the browser

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getToken, setToken, type User } from './api';

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token exists, ask the backend who we are.
  useEffect(() => {
    // No token -> resolve to null right away; otherwise ask the backend who we are.
    (getToken() ? api.me() : Promise.resolve(null))
      .then(setUser)
      .catch(() => clearToken()) // expired / invalid token
      .finally(() => setLoading(false));
  }, []);

  const finish = (res: { accessToken: string; user: User }) => {
    setToken(res.accessToken);
    setUser(res.user);
  };

  const value: AuthState = {
    user,
    loading,
    login: async (email, password) => finish(await api.login(email, password)),
    register: async (email, password) => finish(await api.register(email, password)),
    logout: () => {
      clearToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// Use at the top of a protected page: redirects to /login when logged out.
// (This is only UX. The REAL protection is the JWT guard on the backend.)
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace('/login');
  }, [auth.loading, auth.user, router]);
  return auth;
}
