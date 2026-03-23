import { ArrowRight, HardHat, Rocket, User } from "lucide-react";
import React from "react";

interface ScientistNodeProps {
  name: string;
  title: string;
  tags: string[];
}

const ScientistNode: React.FC<ScientistNodeProps> = ({ name, title, tags }) => (
  <div className="group relative bg-surface-container-low border border-primary/20 p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
         <User className="w-6 h-6 text-primary fill-primary" />
      </div>
      <div>
        <h3 className="font-headline font-bold text-xl text-primary">{name}</h3>
        <p className="text-xs text-on-surface-variant font-label">{title}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] px-2 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full font-label"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

interface EngineerNodeProps {
  name: string;
  title: string;
  tags: string[];
}

const EngineerNode: React.FC<EngineerNodeProps> = ({ name, title, tags }) => (
  <div className="group relative bg-surface-container-low border border-secondary/20 p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300">
    <div className="flex items-center justify-end gap-4 mb-4">
      <div className="text-right">
        <h3 className="font-headline font-bold text-xl text-secondary">{name}</h3>
        <p className="text-xs text-on-surface-variant font-label">{title}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
        <HardHat className="w-6 h-6 text-secondary" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2 justify-end">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] px-2 py-1 bg-secondary/5 text-secondary border border-secondary/10 rounded-full font-label"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

interface EdgeProps {
  topOffset: number;
  lag: string;
}

const TransferEdge: React.FC<EdgeProps> = ({ topOffset, lag }) => (
  <>
    <div
      className="absolute left-0 right-0 h-px node-connector opacity-40"
      style={{ top: `${topOffset}px` }}
    />
    <div
      className="absolute left-1/2 -translate-x-1/2 bg-surface-container px-3 py-1 rounded-full border border-tertiary/20 shadow-xl"
      style={{ top: `${topOffset - 15}px` }}
    >
      <span className="text-[10px] font-bold text-tertiary font-label tracking-tighter">
        {lag}
      </span>
    </div>
    <div
      className="absolute right-0 translate-x-1/2 text-secondary"
      style={{ top: `${topOffset - 5}px` }}
    >
      <ArrowRight className="w-4 h-4" />
    </div>
  </>
);

const GraphPage: React.FC = () => {
  return (
    <main className="lg:ml-64 pt-24 pb-12 px-10 min-h-screen">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-bold font-headline tracking-tight text-on-surface mb-2">
            Bipartite Transfer Graph
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Visualizing the temporal latency between theoretical discovery
            (Science) and practical implementation (Engineering).
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant/15">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium font-label">
              Active Synchronization
            </span>
          </div>
        </div>
      </header>

      {/* Bipartite Graph Grid */}
      <div className="grid grid-cols-12 gap-0 min-h-[700px] relative">
        {/* Scientist Column */}
        <div className="col-span-4 flex flex-col gap-12 z-10">
          <div className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-4 pl-4 border-l border-primary/30">
            Theoretical Origin (Nodes)
          </div>
          <ScientistNode
            name="Alan Turing"
            title="Universal Machine Theory, 1936"
            tags={["COMPUTABILITY", "LOGIC"]}
          />
          <ScientistNode
            name="John von Neumann"
            title="Stored-Program Concept, 1945"
            tags={["ARCHITECTURE", "GAME THEORY"]}
          />
          <ScientistNode
            name="Niels Bohr"
            title="Quantum Mechanics, 1913"
            tags={["QUANTUM PHYSICS", "ATOMIC MODEL"]}
          />
        </div>

        {/* Transfer Edges (Center) */}
        <div className="col-span-4 relative h-full pointer-events-none">
          <TransferEdge topOffset={135} lag="73 YR LAG" />
          <TransferEdge topOffset={310} lag="56 YR LAG" />
          <TransferEdge topOffset={485} lag="98 YR LAG" />
        </div>

        {/* Engineer Column */}
        <div className="col-span-4 flex flex-col gap-12 z-10">
          <div className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-4 pr-4 border-r border-secondary/30 text-right">
            Practical Implementation (Nodes)
          </div>
          <EngineerNode
            name="Deep Learning Engineers"
            title="Neural Network Scaling, 2012"
            tags={["AI OPS", "HPC"]}
          />
          <EngineerNode
            name="IBM Systems Team"
            title="Mainframe Virtualization, 2001"
            tags={["HARDWARE", "KRNL"]}
          />
          <EngineerNode
            name="Quantum Computing Team"
            title="Superconducting Qubits, 2019"
            tags={["CRYO-COOLING", "NOISE REDUX"]}
          />
        </div>
      </div>

      {/* Transfer Efficiency Index */}
      <div className="mt-20 grid grid-cols-12 gap-8">
        <div className="col-span-8 bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10">
          <h4 className="font-headline font-bold text-2xl text-on-surface mb-6">
            Transfer Efficiency Index
          </h4>
          <div className="flex items-center gap-12">
            <div className="flex-1">
              <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4" />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant font-label uppercase tracking-widest">
                Theoretical Saturation (75%)
              </p>
            </div>
            <div className="flex-1">
              <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-1/4" />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant font-label uppercase tracking-widest">
                Engineering Conversion (25%)
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-4 bg-tertiary-container rounded-2xl p-8 text-on-tertiary-container">
          <Rocket className="w-12 h-12 mb-4" />
          <h4 className="font-headline font-bold text-xl mb-2">
            Accelerate Handoff
          </h4>
          <p className="text-sm opacity-80 mb-6">
            Reduce systemic lag by automating the translation between abstract
            notation and practical schemas.
          </p>
          <button className="w-full py-3 bg-on-tertiary-container text-tertiary-container font-bold rounded-xl active:scale-95 transition-transform">
            Deploy Synapse V2
          </button>
        </div>
      </div>

      {/* Background Decorative */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>
    </main>
  );
};

export default GraphPage;
