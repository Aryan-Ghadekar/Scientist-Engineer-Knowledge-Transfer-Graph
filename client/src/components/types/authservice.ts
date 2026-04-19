// src/auth/authService.ts
import type {
  AuthResponse,
  LoginPayload,
  ProfileUpdate,
  SignupPayload,
  TokenRefreshResponse,
  UserProfile,
  UsernameCheckResponse,
} from "./auth.types";

const BASE_URL =  "http://localhost:8000";

// ─────────────────────────────────────────────
// Token helpers (localStorage)
// ─────────────────────────────────────────────

const TOKEN_KEY   = "ktg_access_token";
const REFRESH_KEY = "ktg_refresh_token";

export const tokenStore = {
  getAccess:      ()  => localStorage.getItem(TOKEN_KEY),
  getRefresh:     ()  => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY,   access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─────────────────────────────────────────────
// Fetch wrapper with automatic token injection
// ─────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authenticated) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(err.detail ?? "Request failed.");
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────

export const authService = {

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    tokenStore.set(data.access_token, data.refresh_token);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    tokenStore.set(data.access_token, data.refresh_token);
    return data;
  },

  async logout(): Promise<void> {
    await apiFetch<{ message: string }>("/auth/logout", { method: "POST" }, true);
    tokenStore.clear();
  },

  async getMe(): Promise<UserProfile> {
    return apiFetch<UserProfile>("/auth/me", {}, true);
  },

  async updateMe(payload: ProfileUpdate): Promise<UserProfile> {
    return apiFetch<UserProfile>(
      "/auth/me",
      { method: "PATCH", body: JSON.stringify(payload) },
      true
    );
  },

  async refreshToken(): Promise<void> {
    const refresh_token = tokenStore.getRefresh();
    if (!refresh_token) throw new Error("No refresh token.");
    const data = await apiFetch<TokenRefreshResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    });
    tokenStore.set(data.access_token, data.refresh_token);
  },

  async checkUsername(username: string): Promise<UsernameCheckResponse> {
    return apiFetch<UsernameCheckResponse>(`/auth/check-username/${username}`);
  },

  isAuthenticated(): boolean {
    return !!tokenStore.getAccess();
  },
};

export default authService;