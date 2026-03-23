import React from "react";

const MobileBottomNav: React.FC = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl border-t border-blue-400/15">
      <div className="flex items-center justify-around h-16 px-4">
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          {/* <span className="material-symbols-outlined">hub</span> */}
          <span className="text-[10px] font-label">Nodes</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          {/* <span className="material-symbols-outlined">engineering</span> */}
          <span className="text-[10px] font-label">Execution</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-blue-300">
          {/* <span className="material-symbols-outlined">swap_horiz</span> */}
          <span className="text-[10px] font-label">Sync</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          {/* <span className="material-symbols-outlined">analytics</span> */}
          <span className="text-[10px] font-label">Metrics</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
