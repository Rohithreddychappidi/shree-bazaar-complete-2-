"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, API_URL } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  marketingConsent: boolean;
  profileCompletedAt: string | null;
  avatarUrl: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUB_ADMIN";
};

type ProfileUpdate = { name?: string; phone?: string; whatsappNumber?: string; marketingConsent?: boolean; markProfileComplete?: boolean };

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  googleLoginUrl: string;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial auth check on mount, not a derived-state anti-pattern
    refresh();
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    const updated = await api.patch<AuthUser>("/auth/me", updates);
    setUser(updated);
  };

  // Sub-admin login — the master admin creates these accounts directly with a
  // password (see /admin/staff); there's no self-signup for this.
  const loginWithPassword = async (email: string, password: string) => {
    const loggedIn = await api.post<AuthUser>("/auth/login", { email, password });
    setUser(loggedIn);
  };

  return (
    <AuthContext.Provider value={{ user, loading, googleLoginUrl: `${API_URL}/auth/google`, logout, refresh, updateProfile, loginWithPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
