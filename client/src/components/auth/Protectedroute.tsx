// src/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { Rocket } from "lucide-react";

// ─────────────────────────────────────────────
// Full-screen loading splash (shown during session bootstrap)
// ─────────────────────────────────────────────

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
    {/* Ambient glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

    <div className="relative flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg animate-pulse">
        <Rocket className="w-8 h-8 text-on-primary-fixed" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold font-headline text-primary tracking-widest uppercase">
          Initializing
        </span>
        <span className="flex gap-1 mt-0.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>

      <p className="text-on-surface-variant text-xs tracking-wide font-light">
        Scientist–Engineer Knowledge Transfer Graph
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ProtectedRoute
// Redirects unauthenticated users to /auth/login,
// preserving the intended destination in `state.from`.
// ─────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!isAuthed) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────
// PublicRoute
// Redirects already-authenticated users away from
// login / signup back to their intended destination
// (or "/" by default).
// ─────────────────────────────────────────────

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  const from = (location.state as { from?: string })?.from ?? "/";

  if (isAuthed) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};