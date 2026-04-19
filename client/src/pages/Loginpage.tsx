// src/auth/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, Rocket, AlertCircle } from "lucide-react";
import authService from "../components/types/authservice";
import type { LoginPayload } from "../components/types/auth.types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.login(form);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-on-primary-fixed" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-on-surface-variant text-sm font-light">
            Sign in to your Knowledge Transfer account
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-8 shadow-xl">
          <div className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-error text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@organization.com"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 pr-12 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-xs text-on-surface-variant tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          {/* Sign-up link */}
          <p className="text-center text-sm text-on-surface-variant">
            New to the network?{" "}
            <Link
              to="/auth/signup"
              className="text-primary font-bold hover:underline"
            >
              Create an account →
            </Link>
          </p>
        </div>

        {/* Footer badge */}
        <p className="text-center text-xs text-on-surface-variant/40 mt-6 font-light tracking-wide">
          Scientist–Engineer Knowledge Transfer Graph
        </p>
      </div>
    </div>
  );
};

export default LoginPage;