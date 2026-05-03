import {
  AlertCircle, AlertTriangle, ArrowDownUp, Atom, CheckCircle,
  Gauge, HardHat, Lightbulb, LucideIcon, Network, PencilRuler,
  Rocket, Search, Sparkles, TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types (mirror dashboarddata/models.py)
// ─────────────────────────────────────────────

interface StatCardData {
  total_scientists: number;
  total_engineers: number;
  active_edges: number;
  avg_knowledge_lag: number;
  bottlenecks_detected: number;
  resolved_transfers: number;
}

interface SIPOCData {
  transfer_success_rate: number;
  engineer_readiness: number;
}

interface ActivityItem {
  type: "paper_assigned" | "bottleneck" | "handoff" | "node";
  title: string;
  subtitle: string;
  time: string;
}

interface LagBar {
  label: string;
  value: number; // 0–1 normalised
}

interface LagTrendData {
  bars: LagBar[];
  x_labels: string[];
}

interface DonutSegment {
  label: string;
  value: number; // 0–100
}

interface ResourceDistributionData {
  segments: DonutSegment[];
  center_pct: number;
}

interface DashboardData {
  stats: StatCardData;
  sipoc: SIPOCData;
  activity: { items: ActivityItem[] };
  lag_trend: LagTrendData;
  resource_distribution: ResourceDistributionData;
}

// ─────────────────────────────────────────────
// API base URL — adjust to match your FastAPI server
// ─────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────
// Activity icon/color mapping
// ─────────────────────────────────────────────

const activityMeta: Record<
  ActivityItem["type"],
  { iconBg: string; iconColor: string; icon: LucideIcon }
> = {
  paper_assigned: { iconBg: "bg-primary/10",   iconColor: "text-primary",   icon: Sparkles      },
  bottleneck:     { iconBg: "bg-error/10",     iconColor: "text-error",     icon: AlertTriangle },
  handoff:        { iconBg: "bg-secondary/10", iconColor: "text-secondary", icon: CheckCircle   },
  node:           { iconBg: "bg-tertiary/10",  iconColor: "text-tertiary",  icon: Network       },
};

// ─────────────────────────────────────────────
// Sub-components (identical look to original)
// ─────────────────────────────────────────────

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  labelColor?: string;
  value: string;
  subtext: string;
  critical?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon, iconColor, label, labelColor = "text-slate-500", value, subtext, critical = false,
}) => (
  <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/15 flex flex-col justify-between shadow-[0_4px_40px_rgba(173,198,255,0.06)] relative overflow-hidden">
    {critical && <div className="absolute top-0 right-0 w-1 h-full bg-error" />}
    <div className="flex justify-between items-start mb-4">
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <span className={`text-[10px] uppercase tracking-widest ${labelColor} font-bold`}>{label}</span>
    </div>
    <div>
      <div className="text-3xl font-bold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant">{subtext}</div>
    </div>
  </div>
);

interface PipelineStageProps {
  icon: LucideIcon; label: string; sublabel: string;
  iconBg: string; iconBorder: string; iconColor: string;
  size?: "normal" | "large"; spin?: boolean;
}

const PipelineStage: React.FC<PipelineStageProps> = ({
  icon: Icon, label, sublabel, iconBg, iconBorder, iconColor, size = "normal", spin = false,
}) => (
  <div className="relative z-10 flex flex-col items-center group">
    <div className={`${size === "large" ? "w-20 h-20 rounded-2xl" : "w-16 h-16 rounded-full"} ${iconBg} border ${iconBorder} flex items-center justify-center ${iconColor} mb-3 transition-transform ${spin ? "group-hover:rotate-12" : "group-hover:scale-110"}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="font-headline font-bold text-on-surface">{label}</span>
    <span className={`text-[10px] ${iconColor}/60 font-medium`}>{sublabel}</span>
  </div>
);

interface ActivityItemProps {
  iconBg: string; iconColor: string; icon: LucideIcon;
  title: string; subtitle: string; time: string;
}

const ActivityItemRow: React.FC<ActivityItemProps> = ({
  iconBg, iconColor, icon: Icon, title, subtitle, time,
}) => (
  <div className="p-4 hover:bg-surface-container-highest/50 rounded-xl transition-colors group">
    <div className="flex items-start gap-4">
      <div className={`mt-1 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-on-surface">{title}</div>
        <div className="text-xs text-on-surface-variant mb-1">{subtitle}</div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{time}</div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Skeleton / loading state
// ─────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-surface-container-highest rounded ${className}`} />
);

// ─────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/dashstats/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ── Derived values ────────────────────────

  const stats = data?.stats;
  const sipoc = data?.sipoc;
  const activityItems = data?.activity?.items ?? [];
  const lagBars = data?.lag_trend?.bars ?? [];
  const xLabels = data?.lag_trend?.x_labels ?? [];
  const segments = data?.resource_distribution?.segments ?? [];
  const centerPct = data?.resource_distribution?.center_pct ?? 0;

  // ── Donut stroke calculation ───────────────
  // r=56, circumference=351.85
  const CIRCUMFERENCE = 351.85;
  const donutColors = ["#4d8eff", "#4ae176", "#3a3f5c"];
  let donutOffset = 0;
  const donutArcs = segments.map((seg, i) => {
    const dash = (seg.value / 100) * CIRCUMFERENCE;
    const offset = CIRCUMFERENCE - dash - donutOffset;
    const arc = {
      key: seg.label,
      stroke: donutColors[i] ?? "#888",
      dasharray: CIRCUMFERENCE,
      dashoffset: offset,
    };
    donutOffset += dash;
    return arc;
  });

  // ─────────────────────────────────────────────
  // Error state
  // ─────────────────────────────────────────────

  if (error) {
    return (
      <main className="pt-24 px-10 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-error mx-auto" />
          <p className="text-on-surface-variant text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <main className="pt-24 px-10 pb-20 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-[#818cf8] tracking-tight mb-2">
          Research-to-Product Pipeline Dashboard
        </h1>
        <p className="text-on-surface-variant font-medium text-lg">
          Monitoring the synapse between conceptual theory and engineering reality.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard icon={Atom}        iconColor="text-primary"   label="Theory"    value={String(stats?.total_scientists ?? 0)}       subtext="Total Scientists" />
            <StatCard icon={HardHat}     iconColor="text-secondary" label="Execution" value={String(stats?.total_engineers ?? 0)}        subtext="Total Engineers" />
            <StatCard icon={Network}     iconColor="text-tertiary"  label="Bridge"    value={String(stats?.active_edges ?? 0)}           subtext="Active Edges" />
            <StatCard icon={Gauge}       iconColor="text-primary"   label="Velocity"  value={`${stats?.avg_knowledge_lag ?? 0}y`}        subtext="Avg Knowledge Lag" />
            <StatCard icon={AlertCircle} iconColor="text-error"     label="Critical"  labelColor="text-error" value={String(stats?.bottlenecks_detected ?? 0)} subtext="Bottlenecks Detected" critical />
            <StatCard icon={CheckCircle} iconColor="text-secondary" label="Handoff"   value={String(stats?.resolved_transfers ?? 0)}     subtext="Resolved Transfers" />
          </>
        )}
      </div>

      {/* Pipeline Architecture */}
      <section className="mb-12 hidden md:block">
        <h2 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">timeline</span> Pipeline Architecture
        </h2>
        <div className="flex items-center justify-between w-full p-12 bg-surface-container-low rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #adc6ff 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <PipelineStage icon={Lightbulb}    label="Theory"    sublabel="CONCEPTION" iconBg="bg-primary/10"            iconBorder="border-primary/20"            iconColor="text-primary" />
          <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-primary-container/40 mx-4" />
          <PipelineStage icon={Search}       label="Discovery" sublabel="VALIDATION" iconBg="bg-primary-container/10" iconBorder="border-primary-container/20" iconColor="text-primary-container" />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-container/40 to-tertiary/40 mx-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tertiary/20 animate-ping" />
          </div>
          <PipelineStage icon={ArrowDownUp}  label="Transfer"  sublabel="SYNAPSE"    iconBg="bg-tertiary/10"           iconBorder="border-tertiary/20"           iconColor="text-tertiary"  size="large" spin />
          <div className="flex-1 h-[2px] bg-gradient-to-r from-tertiary/40 to-secondary-container/40 mx-4" />
          <PipelineStage icon={PencilRuler}  label="Prototype" sublabel="ITERATION"  iconBg="bg-secondary-container/10" iconBorder="border-secondary-container/20" iconColor="text-secondary-container" />
          <div className="flex-1 h-px bg-gradient-to-r from-secondary-container/40 to-secondary/40 mx-4" />
          <PipelineStage icon={Rocket}       label="Product"   sublabel="STABLE"     iconBg="bg-secondary/20"          iconBorder="border-secondary/40"          iconColor="text-secondary" />
        </div>
      </section>

      {/* SIPOC + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SIPOC */}
        <div className="lg:col-span-2 bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
          <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span> SIPOC Knowledge Analysis
          </h3>
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: "Supplier", color: "text-primary/80",        content: "Research Labs, External Universities",           rounded: "rounded-l-xl" },
              { label: "Input",    color: "text-primary/80",        content: "Whitepapers, Datasets, Mathematical Proofs" },
              { label: "Process",  color: "text-primary",           content: "Knowledge Graph Ingestion & Synaptic Mapping",    highlight: true },
              { label: "Output",   color: "text-secondary",         content: "Technical Specs, API definitions, Proto-builds" },
              { label: "Customer", color: "text-secondary",         content: "Product Teams, Implementation Squads",            rounded: "rounded-r-xl" },
            ].map((col) => (
              <div key={col.label} className={`p-4 ${col.highlight ? "bg-primary/10 border-x border-primary/20" : "bg-surface-container-high"} ${col.rounded ?? ""} flex flex-col gap-4`}>
                <div className={`text-[10px] font-black uppercase ${col.color}`}>{col.label}</div>
                <div className="text-xs text-on-surface font-medium">{col.content}</div>
              </div>
            ))}
          </div>

          {/* Progress Bars — live data */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>TRANSFER SUCCESS RATE</span>
                <span>{loading ? "—" : `${sipoc?.transfer_success_rate ?? 0}%`}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700" style={{ width: loading ? "0%" : `${sipoc?.transfer_success_rate ?? 0}%` }} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>ENGINEER READINESS</span>
                <span>{loading ? "—" : `${sipoc?.engineer_readiness ?? 0}%`}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container transition-all duration-700" style={{ width: loading ? "0%" : `${sipoc?.engineer_readiness ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-surface-container-high/50 backdrop-blur-md rounded-2xl border border-outline-variant/10 flex flex-col">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">notifications_active</span> Activity Stream
            </h3>
          </div>
          <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[400px]">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl mx-2" />
                ))
              : activityItems.slice(0, 4).map((item, i) => {
                  const meta = activityMeta[item.type] ?? activityMeta.node;
                  return (
                    <ActivityItemRow
                      key={i}
                      iconBg={meta.iconBg}
                      iconColor={meta.iconColor}
                      icon={meta.icon}
                      title={item.title}
                      subtitle={item.subtitle}
                      time={item.time}
                    />
                  );
                })}
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
            <h4 className="font-headline font-bold text-lg mb-4 text-primary">Lag Analysis Trend</h4>
            {loading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : (
              <>
                <div className="h-48 flex items-end justify-between gap-1 px-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 flex flex-col justify-between">
                    {[0, 1, 2].map((i) => <div key={i} className="h-px w-full bg-primary/50" />)}
                  </div>
                  {lagBars.map((bar, i) => {
                    const opacity = bar.value > 0.7 ? "bg-primary-container" : bar.value > 0.5 ? "bg-primary/40" : "bg-primary/20";
                    return (
                      <div key={i} className={`w-full ${opacity} rounded-t-sm transition-all duration-500`} style={{ height: `${Math.max(bar.value * 100, 8)}%` }} />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500">
                  {xLabels.map((l) => <span key={l}>{l}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface-container-high/40 p-1 bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl">
          <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg mb-4 text-secondary">Active Resource Distribution</h4>
            {loading ? (
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            ) : (
              <div className="flex items-center gap-12">
                <div className="relative w-32 h-32 rounded-full border-8 border-surface-container flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    {donutArcs.map((arc) => (
                      <circle
                        key={arc.key}
                        cx="64" cy="64" fill="transparent" r="56"
                        stroke={arc.stroke}
                        strokeDasharray={arc.dasharray}
                        strokeDashoffset={arc.dashoffset}
                        strokeWidth="16"
                      />
                    ))}
                  </svg>
                  <span className="text-xl font-headline font-bold">{centerPct}%</span>
                </div>
                <div className="space-y-3 flex-1">
                  {segments.map((seg, i) => (
                    <div key={seg.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: donutColors[i] ?? "#888" }} />
                      <span className="text-xs text-on-surface-variant font-medium">
                        {seg.label} <span className="text-slate-500">({seg.value}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-[0_0_40px_rgba(77,142,255,0.4)] flex items-center justify-center active:scale-95 transition-all z-50">
        <TrendingUp className="w-6 h-6" />
      </button>
    </main>
  );
};

export default DashboardPage;