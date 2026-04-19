import { ArrowDown, BarChart2, FlaskConical, Plus, Rocket } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadModal from "../components/GraphCreation/UploadModel";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("seenUploadHint");

    if (!seen) {
      setTimeout(() => setShowHint(true), 800); 
    }
  }, []);

  return (
    <main className=" pt-24 px-8 md:px-12 lg:px-20 pb-20 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mb-24 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">
              System Framework
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-headline text-on-surface leading-tight tracking-tight mb-8">
            Scientist–Engineer
            <br />
            <span className="text-primary italic">Knowledge Transfer</span> Graph
          </h1>

          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed mb-10 font-light">
            An advanced architectural framework designed to bridge the gap
            between abstract research and practical engineering execution using
            the SIPOC model and ETVX workflow logic.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/graph")}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-8 py-4 rounded-xl font-bold transition-transform active:scale-95 flex items-center gap-2"
            >
              Initialize Graph{" "}
              <Rocket className="w-5 h-5 text-on-primary-fixed" />
            </button>
            <button className="bg-surface-container-high border border-primary/15 text-primary px-8 py-4 rounded-xl font-bold transition-all hover:bg-primary/5 active:scale-95">
              Documentation
            </button>
          </div>
        </div>
        <UploadModal open={open} onClose={() => setOpen(false)} />
      </section>

      {/* SIPOC Table + Sync Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        {/* SIPOC Framework Table */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-2xl border border-outline-variant/15 p-1 overflow-hidden">
          <div className="p-8 pb-4">
            <h3 className="text-2xl font-bold font-headline text-primary mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">
                schema
              </span>
              SIPOC Framework Analysis
            </h3>
            <p className="text-on-surface-variant text-sm">
              Strategic overview of high-level process components.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-primary font-headline text-xs tracking-widest uppercase">
                  <th className="px-8 py-4">Component</th>
                  <th className="px-8 py-4">Definition</th>
                  <th className="px-8 py-4">Scientist Role</th>
                  <th className="px-8 py-4">Engineer Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                <tr className="hover:bg-surface-container-high/50 transition-colors group">
                  <td className="px-8 py-6 font-bold text-on-surface">
                    Suppliers
                  </td>
                  <td className="px-8 py-6 text-on-surface-variant text-sm">
                    Entity providing inputs
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                      Research Labs
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full text-[10px] font-bold">
                      Tool Vendors
                    </span>
                  </td>
                </tr>
                <tr className="bg-surface-container/30 hover:bg-surface-container-high/50 transition-colors group">
                  <td className="px-8 py-6 font-bold text-on-surface">
                    Inputs
                  </td>
                  <td className="px-8 py-6 text-on-surface-variant text-sm">
                    Required data or materials
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                      Raw Hypothesis
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full text-[10px] font-bold">
                      Compute Resources
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sync Latency Card */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/15 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-9xl">
                <FlaskConical className="w-36 h-36" />
              </span>
            </div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary mb-4 block">
                <BarChart2 className="text-primary mb-4 w-6 h-6" />
              </span>
              <h4 className="text-xl font-bold font-headline mb-2">
                Sync Latency
              </h4>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Average time for theoretical validation to reach production
                environment.
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-primary font-headline">
                  1.4ms
                </span>
                <span className="text-secondary text-sm font-bold mb-1 flex items-center">
                  <span className="material-symbols-outlined text-xs">
                    <ArrowDown className="w-4 h-4 text-secondary" />
                  </span>{" "}
                  12%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setOpen(true);
          setShowHint(false);
          localStorage.setItem("seenUploadHint", "true");
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
      {showHint && (
        <div className="fixed bottom-28 right-8 z-50 animate-fade-in">
          <div className="relative bg-[#020811] border border-cyan-400/30 rounded-lg px-4 py-3 shadow-xl w-56">

            <p className="text-xs text-gray-300 font-mono leading-relaxed">
              Upload your dataset to build the graph.
            </p>

            <p className="text-[10px] text-cyan-400 mt-1 font-mono">
              Click the + button
            </p>

            {/* Arrow */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-[#020811] border-r border-b border-cyan-400/30 rotate-45" />
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;
