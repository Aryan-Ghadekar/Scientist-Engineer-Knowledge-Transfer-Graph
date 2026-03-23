import { AlertCircle, AlertTriangle, CheckCircle, Lightbulb, LucideIcon, Network } from "lucide-react";
import React from "react";

interface AlertCardProps {
  bg: string;
  border: string;
  hoverBg: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  icon: LucideIcon;
  badgeColor: string;
  badge: string;
  id: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  lagColor: string;
  lag: string;
  lagLabel: string;
  lagLabelColor: string;
  filled?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({
  bg,
  border,
  hoverBg,
  iconBg,
  iconBorder,
  iconColor,
  icon: Icon,
  badgeColor,
  badge,
  id,
  title,
  subtitle,
  subtitleColor,
  lagColor,
  lag,
  lagLabel,
  lagLabelColor,
  filled = false,
}) => (
  <div
    className={`group relative ${bg} border ${border} backdrop-blur-md rounded-xl p-6 transition-all ${hoverBg}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <div
          className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center border ${iconBorder}`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold ${badgeColor} uppercase tracking-tighter`}
            >
              {badge}
            </span>
            <span className="text-[10px] text-slate-400/60 font-mono">{id}</span>
          </div>
          <h4 className="text-xl font-headline font-bold text-on-surface mb-1">
            {title}
          </h4>
          <p className={`text-sm ${subtitleColor} font-medium`}>{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-headline font-bold ${lagColor}`}>{lag}</div>
        <div className={`text-[10px] ${lagLabelColor} uppercase font-bold`}>
          {lagLabel}
        </div>
      </div>
    </div>
  </div>
);

interface SeverityBarProps {
  color: string;
  height: string;
  label: string;
}

const SeverityBar: React.FC<SeverityBarProps> = ({ color, height, label }) => (
  <div className="flex flex-col items-center flex-1 group">
    <div
      className={`w-full ${color}/20 rounded-t-lg relative flex items-end overflow-hidden`}
      style={{ height }}
    >
      <div
        className={`w-full ${color} h-full opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
    <span className="mt-4 text-[10px] font-bold text-outline-variant rotate-45 origin-left whitespace-nowrap">
      {label}
    </span>
  </div>
);

const BottlenecksPage: React.FC = () => {
  return (
    <main className="lg:ml-64 pt-24 px-12 pb-12 min-h-screen">
      {/* Header */}
      <header className="mb-12 max-w-4xl">
        <h1 className="text-5xl font-bold font-headline text-blue-400 tracking-tight leading-none mb-4">
          Innovation Bottleneck Detection
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl font-light">
          Real-time mapping of technological friction between theoretical
          research phases and industrial implementation cycles.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Alerts Column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            Active Propagation Alerts
          </h3>

          <AlertCard
            bg="bg-[#450a0a]/40"
            border="border-red-500/30"
            hoverBg="hover:bg-[#450a0a]/60"
            iconBg="bg-red-500/20"
            iconBorder="border-red-500/40"
            iconColor="text-red-400"
            icon={AlertTriangle}
            badgeColor="text-red-400"
            badge="Critical Lag"
            id="ID: AI-AL-99"
            title="Theoretical AI Alignment Research"
            subtitle="Policy acceleration recommended"
            subtitleColor="text-red-200/70"
            lagColor="text-red-400"
            lag="25+ Years"
            lagLabel="Predicted Latency"
            lagLabelColor="text-red-300/50"
          />

          <AlertCard
            bg="bg-[#422006]/40"
            border="border-yellow-500/30"
            hoverBg="hover:bg-[#422006]/60"
            iconBg="bg-yellow-500/20"
            iconBorder="border-yellow-500/40"
            iconColor="text-yellow-400"
            icon={AlertCircle}
            badgeColor="text-yellow-400"
            badge="Moderate Friction"
            id="ID: QM-EC-42"
            title="Quantum Error Correction"
            subtitle="Increase engineering investment"
            subtitleColor="text-yellow-200/70"
            lagColor="text-yellow-400"
            lag="15 Years"
            lagLabel="Predicted Latency"
            lagLabelColor="text-yellow-300/50"
          />

          <AlertCard
            bg="bg-[#064e3b]/40"
            border="border-secondary/30"
            hoverBg="hover:bg-[#064e3b]/60"
            iconBg="bg-secondary/20"
            iconBorder="border-secondary/40"
            iconColor="text-secondary"
            icon={CheckCircle}
            filled
            badgeColor="text-secondary"
            badge="Cycle Complete"
            id="ID: LL-MD-07"
            title="Large Language Models"
            subtitle="Transfer successful"
            subtitleColor="text-green-200/70"
            lagColor="text-secondary"
            lag="3 Years"
            lagLabel="Historical Lag"
            lagLabelColor="text-green-300/50"
          />
        </div>

        {/* Visualization Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          {/* Severity Heatmap */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 shadow-[0_4px_40px_rgba(173,198,255,0.03)]">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-8">
              Severity Heatmap
            </h3>
            <div className="flex items-end justify-between h-64 gap-4 px-4">
              <SeverityBar
                color="bg-error"
                height="92%"
                label="AI Alignment"
              />
              <SeverityBar
                color="bg-secondary-fixed-dim"
                height="65%"
                label="Quantum Error"
              />
              <SeverityBar
                color="bg-primary"
                height="30%"
                label="Fusion Power"
              />
              <SeverityBar
                color="bg-tertiary"
                height="15%"
                label="LLM Tech"
              />
            </div>
            <div className="mt-16 pt-8 border-t border-outline-variant/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-outline">Max Threshold</span>
                <span className="text-error font-mono font-bold">
                  Critical (8.8)
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 relative">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-secondary via-yellow-400 to-error rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-gradient-to-br from-primary-container/20 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <Lightbulb className="w-6 h-6 text-primary mb-4" />
              <h4 className="font-headline font-bold text-primary mb-2">
                Automated Recommendation
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Current data suggests a{" "}
                <span className="text-primary font-bold">14.2%</span>{" "}
                correlation between legislative delays and the AI Alignment
                bottleneck. Redirecting tertiary funding to policy research may
                reduce lag by 4.2 years.
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
          </div>
        </div>
      </div>

      {/* Metric Footer */}
      <footer className="mt-20 flex flex-wrap gap-12 border-t border-outline-variant/10 pt-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">
            Global Transfer Index
          </p>
          <p className="text-3xl font-headline font-light text-on-surface">
            0.68{" "}
            <span className="text-sm font-bold text-error">-0.04</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">
            Nodes Monitored
          </p>
          <p className="text-3xl font-headline font-light text-on-surface">
            12,402
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">
            Active Research Sprints
          </p>
          <p className="text-3xl font-headline font-light text-on-surface">
            412
          </p>
        </div>
        <div className="ml-auto">
          <button className="bg-gradient-to-r from-primary to-primary-container px-8 py-3 rounded-xl font-bold text-on-primary-fixed shadow-lg shadow-primary/10 hover:scale-[0.98] transition-transform">
            Generate Grid Report
          </button>
        </div>
      </footer>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center shadow-2xl hover:bg-surface-bright transition-all">
          <Network className="w-6 h-6 text-primary" />
        </button>
      </div>
    </main>
  );
};

export default BottlenecksPage;
