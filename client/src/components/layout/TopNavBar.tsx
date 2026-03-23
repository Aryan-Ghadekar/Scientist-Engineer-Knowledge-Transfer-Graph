import { Search, Settings, UserCircle } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const TopNavBar: React.FC = () => {
  const location = useLocation();

  const getLinkClass = (path: string): string => {
    return location.pathname === path
      ? "text-blue-300 border-b-2 border-blue-400 pb-1 font-medium tracking-tight font-label"
      : "text-slate-400 hover:text-blue-200 transition-colors font-medium tracking-tight font-label hover:bg-blue-400/10 rounded-lg px-3 py-1";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-blue-400/15 shadow-[0_4px_40px_rgba(173,198,255,0.06)] flex items-center justify-between px-10 h-16 max-w-full mx-auto">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-blue-200 dark:text-blue-100 font-headline">
          Knowledge Transfer Graph
        </span>
        <div className="hidden md:flex items-center gap-6 font-medium tracking-tight text-sm">
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link to="/graph" className={getLinkClass("/graph")}>
            Graph
          </Link>
          <Link to="/lag-analysis" className={getLinkClass("/lag-analysis")}>
            Lag Analysis
          </Link>
          <Link to="/bottlenecks" className={getLinkClass("/bottlenecks")}>
            Bottlenecks
          </Link>
          <Link to="/dashboard" className={getLinkClass("/dashboard")}>
            Dashboard
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center bg-surface-container-high rounded-full px-4 py-1.5 border border-outline-variant/15 hidden md:flex">
          <span className="material-symbols-outlined text-sm text-outline mr-2">
            <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-xs w-48 text-on-surface outline-none"
            placeholder="Search grid..."
            type="text"
          />
        </div>
        <button className="p-2 hover:bg-blue-400/10 rounded-lg transition-all active:scale-95 duration-150">
          <span className="material-symbols-outlined text-blue-200">
             <UserCircle className="w-6 h-6 text-blue-200" />
          </span>
        </button>
        <button className="p-2 hover:bg-blue-400/10 rounded-lg transition-all active:scale-95 duration-150">
          <span className="material-symbols-outlined text-blue-200">
            <Settings className="w-6 h-6 text-blue-200" />
          </span>
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;
