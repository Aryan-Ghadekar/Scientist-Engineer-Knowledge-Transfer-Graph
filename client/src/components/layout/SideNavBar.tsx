import { ArrowLeft, BarChart2, HardHat, LucideIcon, Network, SlidersHorizontal } from "lucide-react";
import React from "react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false }) => {
  if (active) {
    return (
      <a
        className="bg-gradient-to-r from-blue-500/20 to-transparent text-blue-200 border-l-4 border-blue-400 py-3 px-6 flex items-center gap-3 transition-all"
        href="#"
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-label">{label}</span>
      </a>
    );
  }
  return (
    <a
      className="text-slate-500 py-3 px-6 hover:text-slate-200 hover:bg-slate-900 transition-all hover:translate-x-1 duration-200 flex items-center gap-3"
      href="#"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="font-label">{label}</span>
    </a>
  );
};

const SideNavBar: React.FC = () => {
  return (
    <aside className="hidden lg:flex fixed left-0 h-full w-64 z-40 bg-slate-950 flex-col pt-20 border-r border-blue-400/10 tonal-shift bg-slate-900/50">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-black text-blue-200 font-headline">
          Synaptic Grid
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">
          V1.0.4 Phase: Entry
        </p>
      </div>

      <nav className="flex flex-col flex-1">
        <NavItem icon={Network} label="Nodes" />
        <NavItem icon={HardHat} label="Execution" />
        <NavItem icon={ArrowLeft} label="Sync" active />
        <NavItem icon={BarChart2} label="Metrics" />
        <NavItem icon={SlidersHorizontal} label="Settings" />
      </nav>

      <div className="p-6 border-t border-blue-400/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
            AT
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">Dr. Aris Thorne</p>
            <p className="text-[10px] text-slate-500">Principal Scientist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNavBar;
