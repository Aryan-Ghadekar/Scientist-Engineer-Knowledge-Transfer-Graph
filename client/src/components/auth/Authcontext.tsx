// src/auth/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import authService from "../types/authservice";
import type { UserProfile } from "../types/auth.types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AuthState {
  user:        UserProfile | null;
  loading:     boolean;   // initial session check
  isAuthed:    boolean;
}

interface AuthContextValue extends AuthState {
  login:   (email: string, password: string) => Promise<void>;
  logout:  () => Promise<void>;
  refresh: () => Promise<void>;  // re-fetch /me (e.g. after profile update)
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user:     null,
    loading:  true,
    isAuthed: false,
  });

  // On mount: if a token exists, validate it by fetching /auth/me
  useEffect(() => {
    const bootstrap = async () => {
      if (!authService.isAuthenticated()) {
        setState({ user: null, loading: false, isAuthed: false });
        return;
      }
      try {
        const user = await authService.getMe();
        setState({ user, loading: false, isAuthed: true });
      } catch {
        // Token invalid / expired — try refresh once
        try {
          await authService.refreshToken();
          const user = await authService.getMe();
          setState({ user, loading: false, isAuthed: true });
        } catch {
          // Refresh also failed — clear tokens
          authService["tokenStore"] ?? null;
          import("../types/authservice").then(({ tokenStore }) => tokenStore.clear());
          setState({ user: null, loading: false, isAuthed: false });
        }
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setState({ user: data.user, loading: false, isAuthed: true });
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    setState({ user: null, loading: false, isAuthed: false });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const user = await authService.getMe();
      setState((prev) => ({ ...prev, user }));
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}