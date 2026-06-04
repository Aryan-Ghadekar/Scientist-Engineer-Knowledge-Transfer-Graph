// src/components/layout/TopNavBar.tsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  Cpu,
  FlaskConical,
  Microscope,
  GraduationCap,
  BookOpen,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "../auth/Authcontext";
import type { ProfessionType } from "../types/auth.types";

// ─────────────────────────────────────────────
// Profession icon map
// ─────────────────────────────────────────────

const PROFESSION_ICONS: Record<ProfessionType, React.ReactNode> = {
  engineer:   <Cpu           className="w-3.5 h-3.5" />,
  scientist:  <FlaskConical  className="w-3.5 h-3.5" />,
  researcher: <Microscope    className="w-3.5 h-3.5" />,
  student:    <GraduationCap className="w-3.5 h-3.5" />,
  professor:  <BookOpen      className="w-3.5 h-3.5" />,
  other:      <Sparkles      className="w-3.5 h-3.5" />,
};

// ─────────────────────────────────────────────
// Nav link helper
// ─────────────────────────────────────────────

const useLinkClass = () => {
  const location = useLocation();
  return (path: string) =>
    location.pathname === path
      ? "text-blue-300 border-b-2 border-blue-400 pb-1 font-medium tracking-tight font-label"
      : "text-slate-400 hover:text-blue-200 transition-colors font-medium tracking-tight font-label hover:bg-blue-400/10 rounded-lg px-3 py-1";
};

// ─────────────────────────────────────────────
// User Avatar (initials fallback)
// ─────────────────────────────────────────────

const UserAvatar: React.FC<{ name?: string | null; avatarUrl?: string | null; size?: "sm" | "md" }> = ({
  name,
  avatarUrl,
  size = "md",
}) => {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? "User"}
        className={`${dim} rounded-full object-cover ring-2 ring-primary/30`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center font-bold text-on-primary-fixed ring-2 ring-primary/20`}
    >
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────
// User Dropdown Menu
// ─────────────────────────────────────────────

const UserDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* User info header */}
      <div className="px-5 py-4 border-b border-outline-variant/10 bg-surface-container/50">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.full_name} avatarUrl={user?.avatar_url} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-on-surface truncate">
                {user?.full_name ?? user?.username}
              </p>
              {user?.is_verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-on-surface-variant truncate">@{user?.username}</p>
          </div>
        </div>

        {/* Profession + org pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {user?.profession && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold border border-primary/15 capitalize">
              {PROFESSION_ICONS[user.profession]}
              {user.profession}
            </span>
          )}
          {user?.organization && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/15 text-on-surface-variant text-[10px] font-medium truncate max-w-[140px]">
              {user.organization}
            </span>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-2">
        <button
          onClick={() => { navigate("/profile"); onClose(); }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <UserCircle className="w-4 h-4 shrink-0" />
          View Profile
        </button>
        <button
          onClick={() => { navigate("/settings"); onClose(); }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </button>

        <div className="my-1.5 mx-4 h-px bg-outline-variant/10" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TopNavBar
// ─────────────────────────────────────────────

const TopNavBar: React.FC = () => {
  const getLinkClass = useLinkClass();
  const { isAuthed, user, loading } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-blue-400/15 shadow-[0_4px_40px_rgba(173,198,255,0.06)] flex items-center justify-between px-10 h-16 max-w-full mx-auto">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-blue-200 dark:text-blue-100 font-headline">
          Knowledge Transfer Graph
        </span>

        {/* Only show nav links when authenticated */}
        {isAuthed && (
          <div className="hidden md:flex items-center gap-6 font-medium tracking-tight text-sm">
            <Link to="/"             className={getLinkClass("/")}>Home</Link>
            <Link to="/graph"        className={getLinkClass("/graph")}>Graph</Link>
            <Link to="/lag-analysis" className={getLinkClass("/lag-analysis")}>Lag Analysis</Link>
            <Link to="/bottlenecks"  className={getLinkClass("/bottlenecks")}>Bottlenecks</Link>
            <Link to="/dashboard"    className={getLinkClass("/dashboard")}>Dashboard</Link>
            <Link to="/paper-review"       className={getLinkClass("/paper-review")}>Plagiarism Detection</Link>
          </div>
        )}
      </div>

      {/* Right: Search + User controls */}
      <div className="flex items-center gap-3">
        {/* Search — only when logged in */}
        {isAuthed && (
          <div className="relative hidden md:flex items-center bg-surface-container-high rounded-full px-4 py-1.5 border border-outline-variant/15">
            <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-xs w-48 text-on-surface outline-none"
              placeholder="Search graph..."
              type="text"
            />
          </div>
        )}

        {/* ── Authenticated: avatar dropdown ── */}
        {!loading && isAuthed && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-blue-400/10 transition-all active:scale-95 duration-150"
            >
              <UserAvatar name={user?.full_name} avatarUrl={user?.avatar_url} size="sm" />
              <span className="hidden md:block text-xs font-bold text-blue-200 max-w-[90px] truncate">
                {user?.username}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
          </div>
        )}

        {/* ── Not authenticated: Login / Sign up buttons ── */}
        {!loading && !isAuthed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/auth/login")}
              className="px-4 py-1.5 rounded-lg text-sm font-bold text-blue-200 hover:bg-blue-400/10 transition-all active:scale-95"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth/signup")}
              className="px-4 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed transition-all active:scale-95 shadow-md shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" />
        )}

        {/* Settings — always visible */}
        <button
          onClick={() => navigate(isAuthed ? "/settings" : "/auth/login")}
          className="p-2 hover:bg-blue-400/10 rounded-lg transition-all active:scale-95 duration-150"
        >
          <Settings className="w-5 h-5 text-blue-200" />
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;