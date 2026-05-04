import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Lightbulb,
  ListFilter,
  LucideIcon,
  Network,
  Search,
  SearchAlertIcon,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import LagFilterPanel from "../components/LagAnalysis/LagFilterPanel";
import Pagination from "../components/LagAnalysis/Pagination";
import TableState from "../components/LagAnalysis/TableState";
import TableSkeleton from "../components/LagAnalysis/TableSkeleton";
import RankedPapersPage from "./RankedLagAnalysis";
import RankedPapersTable from "../components/LagAnalysis/RankedTable";


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

  const [filters, setFilters] = useState({
    minYear: 1900,
    maxYear: 2025,
    minLag: 0,
    maxLag: 100,
    sortBy: "lag",
  });
  /* ---------------- FETCH DATA ---------------- */

  // const { data, loading, error } = useFetch(
  //   "http://localhost:8000/api/temporal-analysis"
  // );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"lag" | "ranked">("lag");;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:8000/api/temporal-analysis");

        if (!res.ok) {
          throw new Error("Server error");
        }

        const data = await res.json();

        setStats({
          avg: String(data.avg_lag),
          max: String(data.max_lag),
          min: String(data.min_lag),
          total: String(data.total_pairs),
        });

        setTrend(data.trend || []);

        const formatted: LagRowProps[] = (data.rows || []).map((d: ApiRow) => {
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
        });

        setRows(formatted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filtered = rows
    .filter((r) =>
      r.discovery.toLowerCase().includes(search.toLowerCase())
    )
    .filter((r) =>
      r.discoveryYear >= filters.minYear &&
      r.discoveryYear <= filters.maxYear
    )
    .filter((r) => {
      const lag = parseInt(r.lag);
      return lag >= filters.minLag && lag <= filters.maxLag;
    })
    .sort((a, b) => {
      if (filters.sortBy === "lag") {
        return parseInt(b.lag) - parseInt(a.lag);
      } else {
        return b.discoveryYear - a.discoveryYear;
      }
    });

  /* ---------------- Pagination ---------------- */

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8)

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);


  /* ---------------- UI ---------------- */

  return (
    <main className="pt-24 pb-12 px-8 lg:px-20 min-h-screen">
      <div className="flex justify-center mb-8">
        <div className="relative flex bg-surface-container-high rounded-full p-1 w-64">

          {/* Slider background */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-primary transition-all duration-300
        ${type === "lag" ? "left-1" : "left-1/2"}`}
          />

          {/* Lag Button */}
          <button
            onClick={() => setType("lag")}
            className={`relative z-10 w-1/2 py-2 text-sm font-semibold transition-colors
        ${type === "lag" ? "text-white" : "text-on-surface-variant"}`}
          >
            Lag Analysis
          </button>

          {/* Ranked Button */}
          <button
            onClick={() => setType("ranked")}
            className={`relative z-10 w-1/2 py-2 text-sm font-semibold transition-colors
        ${type === "ranked" ? "text-white" : "text-on-surface-variant"}`}
          >
            Ranked Papers
          </button>

        </div>
      </div>
      {type == "lag" ? (<div className="max-w-7xl mx-auto">
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
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {(filters.minYear !== 1900 || filters.maxYear !== 2025) && (
                <span className="px-3 py-1 text-xs rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  Year: {filters.minYear} - {filters.maxYear}
                </span>
              )}

              {(filters.minLag !== 0 || filters.maxLag !== 100) && (
                <span className="px-3 py-1 text-xs rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/20">
                  Lag: {filters.minLag} - {filters.maxLag}
                </span>
              )}

              {/* Clear button */}
              {(filters.minYear !== 1900 ||
                filters.maxYear !== 2025 ||
                filters.minLag !== 0 ||
                filters.maxLag !== 100) && (
                  <button
                    onClick={() =>
                      setFilters({
                        minYear: 1900,
                        maxYear: 2025,
                        minLag: 0,
                        maxLag: 100,
                        sortBy: "lag",
                      })
                    }
                    className="text-xs px-3 py-1 border border-red-400/30 text-red-400 rounded-full hover:bg-red-400/10"
                  >
                    Clear Filters ✕
                  </button>
                )}
            </div>
            <div className="flex items-center gap-3">
              <LagFilterPanel onApply={setFilters} />
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
                {loading ? (
                  <TableSkeleton rows={10} />
                ) : error ? (
                  <tr>
                    <td colSpan={5}>
                      <TableState
                        type="error"
                        message="Failed to fetch temporal data"
                        onRetry={() => window.location.reload()}
                      />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <TableState type="empty" />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => (
                    <LagRow key={i} {...row} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 flex justify-between items-center">
            <p className="text-xs">
              Showing {paginatedData.length} of {stats.total} records
            </p>

            <div className="flex items-center gap-2">
              <p className="text-xs">
                No of rows per page
              </p>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-surface-container-high px-3 py-1 rounded-md text-xs"
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </div>)
        : <RankedPapersTable />
      }
    </main>
  );
};

export default LagAnalysisPage;