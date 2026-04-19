import React, { useState } from "react";
import { Filter, X } from "lucide-react";

interface FilterValues {
  minYear: number;
  maxYear: number;
  minLag: number;
  maxLag: number;
  sortBy: "lag" | "year";
}

interface Props {
  onApply: (filters: FilterValues) => void;
}

const LagFilterPanel: React.FC<Props> = ({ onApply }) => {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({
    minYear: 1900,
    maxYear: 2025,
    minLag: 0,
    maxLag: 100,
    sortBy: "lag",
  });

  const update = (key: keyof FilterValues, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    const resetValues = {
      minYear: 1900,
      maxYear: 2025,
      minLag: 0,
      maxLag: 100,
      sortBy: "lag",
    };
    setFilters(resetValues);
    onApply(resetValues);
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-surface-container-high border border-primary/20 px-4 py-2 rounded-lg text-sm"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex justify-center items-center">
          <div className="w-[420px] bg-[#020811] border border-cyan-400/20 rounded-xl p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-cyan-400 font-mono text-sm tracking-widest">
                Filter Analysis
              </h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Year Range */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2 font-mono">Year Range</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minYear}
                  onChange={(e) => update("minYear", Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-md text-sm"
                />
                <input
                  type="number"
                  value={filters.maxYear}
                  onChange={(e) => update("maxYear", Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Lag Range */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2 font-mono">Lag Range (Years)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minLag}
                  onChange={(e) => update("minLag", Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-md text-sm"
                />
                <input
                  type="number"
                  value={filters.maxLag}
                  onChange={(e) => update("maxLag", Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-2 font-mono">Sort By</p>
              <select
                value={filters.sortBy}
                onChange={(e) => update("sortBy", e.target.value)}
                className="w-full bg-surface-container-high px-3 py-2 rounded-md text-sm"
              >
                <option value="lag">Lag (High → Low)</option>
                <option value="year">Year (Recent → Old)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 text-xs border border-white/20 rounded-md text-gray-400"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  onApply(filters);
                  setOpen(false);
                }}
                className="px-4 py-2 text-xs bg-cyan-400/10 border border-cyan-400/30 rounded-md text-cyan-400"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LagFilterPanel;