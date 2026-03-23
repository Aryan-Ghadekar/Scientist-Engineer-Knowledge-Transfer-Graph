import { Activity, ChevronLeft, ChevronRight, Clock, Download, Lightbulb, ListFilter, LucideIcon, Network, Search, TrendingUp, Zap } from "lucide-react";
import React, { useState } from "react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  valueColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  valueColor,
}) => (
  <div className="bg-surface-container-high p-6 rounded-2xl ghost-border relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Icon />
    </div>
    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-2">
      {label}
    </p>
    <div className="flex items-baseline space-x-2">
      <span className={`text-4xl font-headline font-bold ${valueColor}`}>
        {value}
      </span>
      <span className="text-on-surface-variant font-label text-sm">{unit}</span>
    </div>
  </div>
);

interface LagRowProps {
  discovery: string;
  discoveryYear: number;
  implementation: string;
  implementationYear: number;
  lag: string;
  lagColor: string;
  lagBg: string;
  lagBorder: string;
  pulse?: boolean;
}

const LagRow: React.FC<LagRowProps> = ({
  discovery,
  discoveryYear,
  implementation,
  implementationYear,
  lag,
  lagColor,
  lagBg,
  lagBorder,
  pulse = false,
}) => (
  <tr className="hover:bg-primary/5 transition-colors group">
    <td className="px-8 py-6">
      <div className="flex items-center space-x-3">
        <div
          className={`w-2 h-2 rounded-full bg-primary${pulse ? " animate-pulse" : "/40"}`}
        />
        <span className="font-headline font-semibold text-on-surface">
          {discovery}
        </span>
      </div>
    </td>
    <td className="px-8 py-6 text-center font-label text-on-surface-variant">
      {discoveryYear}
    </td>
    <td className="px-8 py-6 font-headline text-on-surface">{implementation}</td>
    <td className="px-8 py-6 text-center font-label text-on-surface-variant">
      {implementationYear}
    </td>
    <td className="px-8 py-6 text-right">
      <span
        className={`inline-flex items-center ${lagBg} ${lagColor} px-3 py-1 rounded-full text-xs font-bold border ${lagBorder}`}
      >
        {lag}
      </span>
    </td>
  </tr>
);

const LagAnalysisPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const rows: LagRowProps[] = [
    {
      discovery: "Quantum Mechanics",
      discoveryYear: 1925,
      implementation: "Quantum Computing R&D",
      implementationYear: 1998,
      lag: "73 yrs",
      lagColor: "text-error",
      lagBg: "bg-error-container/20",
      lagBorder: "border-error/20",
      pulse: true,
    },
    {
      discovery: "Neural Networks",
      discoveryYear: 1943,
      implementation: "Commercial AI Scale",
      implementationYear: 1986,
      lag: "43 yrs",
      lagColor: "text-tertiary",
      lagBg: "bg-tertiary-container/20",
      lagBorder: "border-tertiary/20",
    },
    {
      discovery: "Transformer Theory",
      discoveryYear: 2017,
      implementation: "GPT-3 Deployment",
      implementationYear: 2020,
      lag: "3 yrs",
      lagColor: "text-secondary",
      lagBg: "bg-secondary-container/20",
      lagBorder: "border-secondary/20",
    },
    {
      discovery: "Semiconductor Physics",
      discoveryYear: 1931,
      implementation: "First Transistor",
      implementationYear: 1947,
      lag: "16 yrs",
      lagColor: "text-tertiary",
      lagBg: "bg-tertiary-container/20",
      lagBorder: "border-tertiary/20",
    },
  ];

  const filtered = rows.filter((r) =>
    r.discovery.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="lg:pl-64 pt-24 pb-12 px-8 lg:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-container tracking-tight mb-2">
            Theory → Implementation Lag Analysis
          </h1>
          <p className="text-on-surface-variant font-body max-w-2xl opacity-80">
            Measuring the temporal gap between theoretical discovery and
            practical engineering implementation across scientific epochs.
          </p>
        </header>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Clock}
            label="Avg Lag"
            value="28.5"
            unit="yrs"
            valueColor="text-primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Max Lag"
            value="73"
            unit="yrs"
            valueColor="text-error"
          />
          <StatCard
            icon={Zap}
            label="Min Lag"
            value="3"
            unit="yrs"
            valueColor="text-secondary"
          />
          <StatCard
            icon={Network}
            label="Total Pairs"
            value="42"
            unit="nodes"
            valueColor="text-tertiary"
          />
        </section>

        {/* Table Section */}
        <section className="bg-surface-container rounded-2xl overflow-hidden ghost-border">
          {/* Search & Filters */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                <Search className="w-4 h-4" />
              </span>
              <input
                className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-outline-variant font-body text-sm transition-all outline-none"
                placeholder="Search discoveries..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-surface-container-highest px-4 py-3 rounded-xl hover:bg-surface-bright transition-colors text-sm font-medium">
                <ListFilter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-surface-container-highest px-4 py-3 rounded-xl hover:bg-surface-bright transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-8 py-5 text-xs text-outline-variant font-bold uppercase tracking-wider">
                    Discovery
                  </th>
                  <th className="px-8 py-5 text-xs text-outline-variant font-bold uppercase tracking-wider text-center">
                    Year
                  </th>
                  <th className="px-8 py-5 text-xs text-outline-variant font-bold uppercase tracking-wider">
                    Implementation
                  </th>
                  <th className="px-8 py-5 text-xs text-outline-variant font-bold uppercase tracking-wider text-center">
                    Year
                  </th>
                  <th className="px-8 py-5 text-xs text-outline-variant font-bold uppercase tracking-wider text-right">
                    Lag (years)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((row, i) => (
                  <LagRow key={i} {...row} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-4 bg-surface-container-low/50 flex justify-between items-center">
            <p className="text-xs text-outline-variant font-label">
              Showing {filtered.length} of 42 theory-to-implementation records
            </p>
            <div className="flex space-x-2">
              <button
                className="p-2 hover:bg-surface-bright rounded-lg disabled:opacity-30"
                disabled
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-surface-bright rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Visual Insight */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Bar Chart */}
          <div className="lg:col-span-8 bg-surface-container-high rounded-2xl p-8 ghost-border relative overflow-hidden">
            <h3 className="font-headline text-xl font-bold mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Global Lag Trend Over Time</span>
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2 px-4">
              {[
                { h: "90%", color: "bg-error-container/30", tooltip: "1920s: 70y avg" },
                { h: "85%", color: "bg-error-container/30" },
                { h: "60%", color: "bg-tertiary-container/30" },
                { h: "55%", color: "bg-tertiary-container/30" },
                { h: "45%", color: "bg-tertiary-container/30" },
                { h: "25%", color: "bg-secondary-container/30", tooltip: "2020s: 4y avg" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`w-full ${bar.color} rounded-t-lg relative group`}
                  style={{ height: bar.h }}
                >
                  {bar.tooltip && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] whitespace-nowrap">
                      {bar.tooltip}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] uppercase font-bold tracking-tighter text-outline-variant">
              {["1920", "1940", "1960", "1980", "2000", "Present"].map((yr) => (
                <span key={yr}>{yr}</span>
              ))}
            </div>
          </div>

          {/* Insight Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-highest p-6 rounded-2xl ghost-border">
              <h4 className="font-headline font-bold text-lg mb-2">
                Key Bottleneck
              </h4>
              <p className="text-sm text-on-surface-variant font-body mb-4 leading-relaxed">
                Most delays originate from{" "}
                <span className="text-error font-bold italic">
                  Manufacturing Precision
                </span>{" "}
                constraints rather than theoretical gaps.
              </p>
              <button className="w-full bg-surface-bright py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border border-outline-variant/10">
                View Detailed Report
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary-container/20 to-transparent p-6 rounded-2xl ghost-border border-primary-container/20">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-secondary fill-secondary" />
                <span className="font-headline font-bold text-on-surface">
                  Insight
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-body italic leading-relaxed">
                "The compression of lag time is accelerating exponentially due
                to digital simulation fidelity."
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LagAnalysisPage;
