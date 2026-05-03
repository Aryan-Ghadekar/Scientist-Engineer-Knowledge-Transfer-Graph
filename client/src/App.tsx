// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import TopNavBar from "./components/layout/TopNavBar";
import MobileBottomNav from "./components/layout/MobileBottomNav";

// Pages
import HomePage         from "./pages/HomePage";
import GraphPage        from "./pages/GraphPage";
import LagAnalysisPage  from "./pages/LagAnalysisPage";
import BottlenecksPage  from "./pages/BottlenecksPage";
import DashboardPage    from "./pages/DashboardPage";

// Auth pages
import LoginPage  from "./pages/Loginpage";
import SignupPage from "./pages/Signuppage";

// Auth guards & context
import { AuthProvider }              from "./components/auth/Authcontext";
import { ProtectedRoute, PublicRoute } from "./components/auth/Protectedroute";

// ─────────────────────────────────────────────
// Layout wrapper — shared chrome for app pages
// (nav bars are hidden on auth pages via a
//  separate route group below)
// ─────────────────────────────────────────────

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col h-screen bg-surface text-on-surface font-body overflow-x-hidden selection:bg-primary/30 min-h-screen">
    <TopNavBar />
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto w-full">
        {children}
      </div>
    </div>
    <MobileBottomNav />
  </div>
);

// ─────────────────────────────────────────────
// Auth page layout — clean, no nav bars
// ─────────────────────────────────────────────

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary/30">
    {children}
  </div>
);

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/*
        AuthProvider must wrap everything so useAuth()
        is available in TopNavBar and all route components.
      */}
      <AuthProvider>
        <Routes>
          {/* ── Auth routes (public only — redirect away if already logged in) ── */}
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <PublicRoute>
                <AuthLayout>
                  <SignupPage />
                </AuthLayout>
              </PublicRoute>
            }
          />

          {/* Convenience redirect: /login → /auth/login */}
          <Route path="/login"  element={<Navigate to="/auth/login"  replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

          {/* ── Protected app routes ── */}
          <Route
            path="/"
            element={
              // <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/graph"
            element={
              // <ProtectedRoute>
                <AppLayout>
                  <GraphPage />
                </AppLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/lag-analysis"
            element={
              // <ProtectedRoute>
                <AppLayout>
                  <LagAnalysisPage />
                </AppLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/bottlenecks"
            element={
              // <ProtectedRoute>
                <AppLayout>
                  <BottlenecksPage />
                </AppLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              // </ProtectedRoute>
            }
          />

          {/* Catch-all: unknown routes → home (which will redirect to login if unauthed) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;