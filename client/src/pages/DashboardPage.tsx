import { AlertCircle, AlertTriangle, ArrowDownUp, Atom, CheckCircle, Gauge, HardHat, Lightbulb, LucideIcon, Network, PencilRuler, Rocket, Search, Sparkles, TrendingUp } from "lucide-react";
import React from "react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  labelColor?: string;
  value: string;
  subtext: string;
  critical?: boolean;
  filled?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor,
  label,
  labelColor = "text-slate-500",
  value,
  subtext,
  critical = false,
}) => (
  <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/15 flex flex-col justify-between shadow-[0_4px_40px_rgba(173,198,255,0.06)] relative overflow-hidden">
    {critical && (
      <div className="absolute top-0 right-0 w-1 h-full bg-error" />
    )}
    <div className="flex justify-between items-start mb-4">
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <span className={`text-[10px] uppercase tracking-widest ${labelColor} font-bold`}>
        {label}
      </span>
    </div>
    <div>
      <div className="text-3xl font-bold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant">{subtext}</div>
    </div>
  </div>
);

interface PipelineStageProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  size?: "normal" | "large";
  spin?: boolean;
}

const PipelineStage: React.FC<PipelineStageProps> = ({
  icon: Icon,
  label,
  sublabel,
  iconBg,
  iconBorder,
  iconColor,
  size = "normal",
  spin = false,
}) => {
  const sizeClass =
    size === "large"
      ? "w-20 h-20 rounded-2xl"
      : "w-16 h-16 rounded-full";
  return (
    <div className="relative z-10 flex flex-col items-center group">
      <div
        className={`${sizeClass} ${iconBg} border ${iconBorder} flex items-center justify-center ${iconColor} mb-3 transition-transform ${spin ? "group-hover:rotate-12" : "group-hover:scale-110"
          }`}
      >
         <Icon className="w-6 h-6" />
      </div>
      <span className="font-headline font-bold text-on-surface">{label}</span>
      <span className={`text-[10px] ${iconColor}/60 font-medium`}>{sublabel}</span>
    </div>
  );
};

interface ActivityItemProps {
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  time: string;
  filled?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  iconBg,
  iconColor,
  icon: Icon,
  title,
  subtitle,
  time,
}) => (
  <div className="p-4 hover:bg-surface-container-highest/50 rounded-xl transition-colors group">
    <div className="flex items-start gap-4">
      <div
        className={`mt-1 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-on-surface">{title}</div>
        <div className="text-xs text-on-surface-variant mb-1">{subtitle}</div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          {time}
        </div>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <main className="pt-24 px-10 pb-20 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-[#818cf8] tracking-tight mb-2">
          Research-to-Product Pipeline Dashboard
        </h1>
        <p className="text-on-surface-variant font-medium text-lg">
          Monitoring the synapse between conceptual theory and engineering
          reality.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <StatCard
          icon={Atom}
          iconColor="text-primary"
          label="Theory"
          value="150"
          subtext="Total Scientists"
          filled
        />
        <StatCard
          icon={HardHat}
          iconColor="text-secondary"
          label="Execution"
          value="450"
          subtext="Total Engineers"
          filled
        />
        <StatCard
          icon={Network}
          iconColor="text-tertiary"
          label="Bridge"
          value="85"
          subtext="Active Edges"
          filled
        />
        <StatCard
          icon={Gauge}
          iconColor="text-primary"
          label="Velocity"
          value="28.5y"
          subtext="Avg Knowledge Lag"
          filled
        />
        <StatCard
          icon={AlertCircle}
          iconColor="text-error"
          label="Critical"
          labelColor="text-error"
          value="12"
          subtext="Bottlenecks Detected"
          critical
          filled
        />
        <StatCard
          icon={CheckCircle}
          iconColor="text-secondary"
          label="Handoff"
          value="32"
          subtext="Resolved Transfers"
          filled
        />
      </div>

      {/* Pipeline Architecture */}
      <section className="mb-12 hidden md:block">
        <h2 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">timeline</span>{" "}
          Pipeline Architecture
        </h2>
        <div className="flex items-center justify-between w-full p-12 bg-surface-container-low rounded-2xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #adc6ff 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <PipelineStage
            icon={Lightbulb}
            label="Theory"
            sublabel="CONCEPTION"
            iconBg="bg-primary/10"
            iconBorder="border-primary/20"
            iconColor="text-primary"
          />
          <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-primary-container/40 mx-4" />
          <PipelineStage
            icon={Search}
            label="Discovery"
            sublabel="VALIDATION"
            iconBg="bg-primary-container/10"
            iconBorder="border-primary-container/20"
            iconColor="text-primary-container"
          />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-container/40 to-tertiary/40 mx-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tertiary/20 animate-ping" />
          </div>
          <PipelineStage
            icon={ArrowDownUp}
            label="Transfer"
            sublabel="SYNAPSE"
            iconBg="bg-tertiary/10"
            iconBorder="border-tertiary/20"
            iconColor="text-tertiary"
            size="large"
            spin
          />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-tertiary/40 to-secondary-container/40 mx-4" />
          <PipelineStage
            icon={PencilRuler}
            label="Prototype"
            sublabel="ITERATION"
            iconBg="bg-secondary-container/10"
            iconBorder="border-secondary-container/20"
            iconColor="text-secondary-container"
          />
          <div className="flex-1 h-px bg-gradient-to-r from-secondary-container/40 to-secondary/40 mx-4" />
          <PipelineStage
            icon={Rocket}
            label="Product"
            sublabel="STABLE"
            iconBg="bg-secondary/20"
            iconBorder="border-secondary/40"
            iconColor="text-secondary"
          />
        </div>
      </section>

      {/* SIPOC + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SIPOC Analysis */}
        <div className="lg:col-span-2 bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
          <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              analytics
            </span>{" "}
            SIPOC Knowledge Analysis
          </h3>
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: "Supplier", color: "text-primary/80", content: "Research Labs, External Universities", rounded: "rounded-l-xl" },
              { label: "Input", color: "text-primary/80", content: "Whitepapers, Datasets, Mathematical Proofs" },
              { label: "Process", color: "text-primary", content: "Knowledge Graph Ingestion & Synaptic Mapping", highlight: true },
              { label: "Output", color: "text-secondary", content: "Technical Specs, API definitions, Proto-builds" },
              { label: "Customer", color: "text-secondary", content: "Product Teams, Implementation Squads", rounded: "rounded-r-xl" },
            ].map((col) => (
              <div
                key={col.label}
                className={`p-4 ${col.highlight ? "bg-primary/10 border-x border-primary/20" : "bg-surface-container-high"} ${col.rounded ?? ""} flex flex-col gap-4`}
              >
                <div className={`text-[10px] font-black uppercase ${col.color}`}>
                  {col.label}
                </div>
                <div className="text-xs text-on-surface font-medium">
                  {col.content}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>TRANSFER SUCCESS RATE</span>
                <span>84%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[84%]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>ENGINEER READINESS</span>
                <span>62%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container w-[62%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-surface-container-high/50 backdrop-blur-md rounded-2xl border border-outline-variant/10 flex flex-col">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">
                notifications_active
              </span>{" "}
              Activity Stream
            </h3>
          </div>
          <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[400px]">
            <ActivityItem
              iconBg="bg-primary/10"
              iconColor="text-primary"
              icon={Sparkles}
              title="LLM Quantization Paper"
              subtitle="Assigned to Core Infrastructure"
              time="4m ago"
            />
            <ActivityItem
              iconBg="bg-error/10"
              iconColor="text-error"
              icon={AlertTriangle}
              filled
              title="Bottleneck Detected"
              subtitle="Graph Synapse #402 failing latency check"
              time="18m ago"
            />
            <ActivityItem
              iconBg="bg-secondary/10"
              iconColor="text-secondary"
              icon={CheckCircle}
              title="Successful Handoff"
              subtitle="Quantum-Safe Encryption to Security SDK"
              time="1h ago"
            />
            <ActivityItem
              iconBg="bg-tertiary/10"
              iconColor="text-tertiary"
              icon={Network}
              title="New Node Created"
              subtitle="Neuromorphic Computing Lab Edge"
              time="3h ago"
            />
          </div>
          <button className="m-6 py-2 px-4 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all">
            VIEW ALL HISTORY
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lag Trend Bar Chart */}
        <div className="bg-surface-container-high/40 p-1 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl">
          <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg mb-4 text-primary">
              Lag Analysis Trend
            </h4>
            <div className="h-48 flex items-end justify-between gap-1 px-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 flex flex-col justify-between">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-px w-full bg-primary/50" />
                ))}
              </div>
              {[
                { h: "40%", color: "bg-primary/20" },
                { h: "60%", color: "bg-primary/20" },
                { h: "45%", color: "bg-primary/20" },
                { h: "70%", color: "bg-primary/40" },
                { h: "85%", color: "bg-primary/40" },
                { h: "100%", color: "bg-primary-container" },
                { h: "90%", color: "bg-primary-container" },
                { h: "95%", color: "bg-primary-container" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`w-full ${bar.color} rounded-t-sm`}
                  style={{ height: bar.h }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500">
              <span>OCT 23</span>
              <span>NOV 23</span>
              <span>DEC 23</span>
              <span>JAN 24</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface-container-high/40 p-1 bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl">
          <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg mb-4 text-secondary">
              Active Resource Distribution
            </h4>
            <div className="flex items-center gap-12">
              <div className="relative w-32 h-32 rounded-full border-8 border-surface-container flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="56"
                    stroke="#4d8eff"
                    strokeDasharray="351.85"
                    strokeDashoffset="105.5"
                    strokeWidth="16"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="56"
                    stroke="#4ae176"
                    strokeDasharray="351.85"
                    strokeDashoffset="281.5"
                    strokeWidth="16"
                  />
                </svg>
                <span className="text-xl font-headline font-bold">70%</span>
              </div>
              <div className="space-y-3 flex-1">
                {[
                  { color: "bg-primary-container", label: "Research Clusters" },
                  { color: "bg-secondary", label: "Dev Integrations" },
                  { color: "bg-surface-container-highest", label: "Idle Capacity" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs text-on-surface-variant font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-[0_0_40px_rgba(77,142,255,0.4)] flex items-center justify-center active:scale-95 transition-all z-50">
        <TrendingUp className="w-6 h-6"/>
      </button>
    </main>
  );
};

export default DashboardPage;
