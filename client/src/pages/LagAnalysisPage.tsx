


import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Lightbulb,
  ListFilter,
  LucideIcon,
  Network,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  valueColor: string;
}

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

interface ApiRow {
  paper_id: string;
  paper_title: string;
  paper_year: number;
  patent_title: string;
  patent_year: number;
  time_gap: number;
}

interface TrendItem {
  year: number;
  avg_lag: number;
}


/* ---------------- COMPONENTS ---------------- */

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
      <span className="text-on-surface-variant font-label text-sm">
        {unit}
      </span>
    </div>
  </div>
);

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
          className={`w-2 h-2 rounded-full bg-primary${pulse ? " animate-pulse" : "/40"
            }`}
        />
        <span className="font-headline font-semibold text-on-surface">
          {discovery}
        </span>
      </div>
    </td>
    <td className="px-8 py-6 text-center font-label text-on-surface-variant">
      {discoveryYear}
    </td>
    <td className="px-8 py-6 font-headline text-on-surface">
      {implementation}
    </td>
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

/* ---------------- MAIN PAGE ---------------- */

const LagAnalysisPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<LagRowProps[]>([]);
  const [stats, setStats] = useState({
    avg: "0",
    max: "0",
    min: "0",
    total: "0",
  });
  const [trend, setTrend] = useState<TrendItem[]>([]);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/temporal-analysis"
        );
        const data = await res.json();

        setStats({
          avg: String(data.avg_lag),
          max: String(data.max_lag),
          min: String(data.min_lag),
          total: String(data.total_pairs),
        });

        setTrend(data.trend || []);

        const formatted: LagRowProps[] = (data.rows || []).map(
          (d: ApiRow) => {
            const lag = d.time_gap;

            return {
              discovery: d.paper_title || `Paper ${d.paper_id}`,   
              discoveryYear: d.paper_year || 0,                    
              implementation: d.patent_title || "Patent",          
              implementationYear: d.patent_year || 0,            
              lag: `${lag} yrs`,

              lagColor:
                lag > 30
                  ? "text-error"
                  : lag > 10
                    ? "text-tertiary"
                    : "text-secondary",

              lagBg:
                lag > 30
                  ? "bg-error-container/20"
                  : lag > 10
                    ? "bg-tertiary-container/20"
                    : "bg-secondary-container/20",

              lagBorder:
                lag > 30
                  ? "border-error/20"
                  : lag > 10
                    ? "border-tertiary/20"
                    : "border-secondary/20",

              pulse: lag > 50,
            };
          }
        );

        setRows(formatted);
      } catch (err) {
        console.error("Failed to fetch temporal data", err);
      }
    };

    fetchData();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filtered = rows.filter((r) =>
    r.discovery.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- UI ---------------- */

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
            practical engineering implementation across scientific
            epochs.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Clock}
            label="Avg Lag"
            value={stats.avg}
            unit="yrs"
            valueColor="text-primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Max Lag"
            value={stats.max}
            unit="yrs"
            valueColor="text-error"
          />
          <StatCard
            icon={Zap}
            label="Min Lag"
            value={stats.min}
            unit="yrs"
            valueColor="text-secondary"
          />
          <StatCard
            icon={Network}
            label="Total Pairs"
            value={stats.total}
            unit="nodes"
            valueColor="text-tertiary"
          />
        </section>

        {/* Table */}
        <section className="bg-surface-container rounded-2xl overflow-hidden ghost-border">
          {/* Search */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
            <div className="relative w-full md:w-96">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                <Search className="w-4 h-4" />
              </span>
              <input
                className="w-full bg-surface-container-highest rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/50 text-on-surface text-sm outline-none"
                placeholder="Search discoveries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-8 py-5 text-xs font-bold uppercase">
                    Discovery
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-center">
                    Year
                  </th>
                  <th className="px-8 py-5 text-xs font-bold">
                    Implementation
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-center">
                    Year
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-right">
                    Lag
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <LagRow key={i} {...row} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 flex justify-between items-center">
            <p className="text-xs">
              Showing {filtered.length} of {stats.total} records
            </p>
            <div className="flex space-x-2">
              <button className="p-2" disabled>
                <ChevronLeft />
              </button>
              <button className="p-2">
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* Trend Chart */}
        {/* <section className="mt-12">
          <div className="bg-surface-container-high p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Global Lag Trend</span>
            </h3>

            <div className="h-64 flex items-end space-x-2">
              {trend.map((t, i) => (
                <div
                  key={i}
                  className="w-full bg-tertiary-container/30 rounded-t-lg"
                  style={{
                    height: `${Math.min(t.avg_lag * 2, 100)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </section> */}
      </div>
    </main>
  );
};

export default LagAnalysisPage;