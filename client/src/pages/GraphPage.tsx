/**
 * GraphPage.tsx
 *
 * Main page for the Paper ↔ Patent bipartite knowledge graph.
 *
 * Responsibilities:
 *   • Fetch graph data from the backend on mount (with loading / error states)
 *   • Own all selection state (selected node, selected edge, filters)
 *   • Search bar — filters visible nodes + edges by paper/patent title or id
 *   • Compose the 3-D canvas + HUD panels
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";

import BipartiteGraph3D from "../components/Bipartitegraph3d";
import NodeInfoPanel    from "../components/Nodeinfopanel";
import EdgeInfoPanel    from "../components/Edgeinfopanel";
import { StatsBar, Legend, ClickHint } from "../components/GraphHUD";

import {
  GraphData,
  GraphNode,
  SelectedEdgeState,
} from "../components/types/graph.types";


// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:8000";

async function fetchGraphData(limit: number, minSim: number): Promise<GraphData> {
  const url = `${API_BASE}/api/graph/bipartite?limit=${limit}&min_similarity=${minSim}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<GraphData>;
}


// ── Search filtering ──────────────────────────────────────────────────────────

/**
 * Given a raw GraphData and a search string, returns a filtered GraphData
 * containing only nodes whose title or id matches, plus all edges that
 * connect at least one matched node (so you always see the full neighbourhood).
 *
 * Empty query → returns the full dataset unchanged.
 */
function filterGraphBySearch(data: GraphData, query: string): GraphData {
  const q = query.trim().toLowerCase();
  if (!q) return data;

  // 1. Which papers / patents directly match the query?
  const matchedPaperIds = new Set(
    data.papers
      .filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .map(p => p.id)
  );
  const matchedPatentIds = new Set(
    data.patents
      .filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .map(p => p.id)
  );

  // 2. Edges that touch at least one matched node
  const relevantEdges = data.edges.filter(
    e => matchedPaperIds.has(e.source) || matchedPatentIds.has(e.target)
  );

  // 3. Pull in the other endpoint of each relevant edge (shows the connections)
  const visiblePaperIds  = new Set(matchedPaperIds);
  const visiblePatentIds = new Set(matchedPatentIds);
  relevantEdges.forEach(e => {
    visiblePaperIds.add(e.source);
    visiblePatentIds.add(e.target);
  });

  const filteredPapers  = data.papers.filter(p => visiblePaperIds.has(p.id));
  const filteredPatents = data.patents.filter(p => visiblePatentIds.has(p.id));

  return {
    ...data,
    papers:        filteredPapers,
    patents:       filteredPatents,
    edges:         relevantEdges,
    total_papers:  filteredPapers.length,
    total_patents: filteredPatents.length,
    total_edges:   relevantEdges.length,
  };
}


// ── Suggestion dropdown item ──────────────────────────────────────────────────

interface SuggestionItemProps {
  label:  string;
  sub:    string;
  type:   "paper" | "patent";
  onPick: () => void;
}

function SuggestionItem({ label, sub, type, onPick }: SuggestionItemProps) {
  const accent = type === "paper" ? "#22d3ee" : "#4ade80";
  return (
    <button
      onMouseDown={onPick}   // mouseDown fires before the input's onBlur
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        width:        "100%",
        padding:      "8px 14px",
        background:   "transparent",
        border:       "none",
        cursor:       "pointer",
        textAlign:    "left",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition:   "background 100ms",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${accent}12`)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* type badge */}
      <span style={{
        fontSize:    9,
        color:       accent,
        fontWeight:  700,
        width:       46,
        flexShrink:  0,
        fontFamily:  "monospace",
        textTransform: "uppercase",
      }}>
        {type}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: "#4a6070", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub}
        </div>
      </div>
    </button>
  );
}


// ── Search bar component ──────────────────────────────────────────────────────

interface SearchBarProps {
  query:    string;
  onChange: (q: string) => void;
  onClear:  () => void;
  data:     GraphData | null;
}

function SearchBar({ query, onChange, onClear, data }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build suggestion list (max 8 items, papers first)
  const suggestions = useMemo(() => {
    if (!data || !query.trim()) return [];
    const q = query.trim().toLowerCase();

    const paperHits = data.papers
      .filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ id: p.id, label: p.title, sub: p.id, type: "paper" as const }));

    const patentHits = data.patents
      .filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ id: p.id, label: p.title, sub: p.id, type: "patent" as const }));

    return [...paperHits, ...patentHits].slice(0, 8);
  }, [query, data]);

  const showDropdown = focused && suggestions.length > 0;
  const accent       = "#22d3ee";

  return (
    <div style={{ position: "relative", width: 400 }}>

      {/* Input row */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        gap:            8,
        background:     focused ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.04)",
        border:         `1px solid ${focused ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.10)"}`,
        borderRadius:   showDropdown ? "8px 8px 0 0" : 8,
        padding:        "7px 12px",
        transition:     "all 150ms",
      }}>
        {/* magnifier icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={focused ? accent : "#4a6070"} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)} // slight delay so mouseDown fires
          placeholder="Search papers or patents by title / ID…"
          style={{
            flex:       1,
            background: "transparent",
            border:     "none",
            outline:    "none",
            color:      "#e2e8f0",
            fontSize:   12,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        />

        {/* result count pill */}
        {query && data && (
          <span style={{
            fontSize:     9,
            color:        "#4a6070",
            fontFamily:   "monospace",
            whiteSpace:   "nowrap",
            padding:      "2px 6px",
            background:   "rgba(255,255,255,0.05)",
            borderRadius: 4,
          }}>
            {filterGraphBySearch(data, query).total_papers}P · {filterGraphBySearch(data, query).total_patents}PT
          </span>
        )}

        {/* clear button */}
        {query && (
          <button
            onClick={() => { onClear(); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", color: "#4a6070", cursor: "pointer", fontSize: 17, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestion dropdown */}
      {showDropdown && (
        <div style={{
          position:       "absolute",
          top:            "100%",
          left:           0,
          right:          0,
          background:     "rgba(4,9,20,0.98)",
          border:         "1px solid rgba(34,211,238,0.22)",
          borderTop:      "none",
          borderRadius:   "0 0 8px 8px",
          backdropFilter: "blur(20px)",
          zIndex:         200,
          overflow:       "hidden",
          boxShadow:      "0 16px 40px rgba(0,0,0,0.8)",
        }}>
          <div style={{ padding: "6px 14px 4px", fontSize: 9, color: "#3a5a70", fontFamily: "monospace", letterSpacing: "0.10em", textTransform: "uppercase" }}>
            Suggestions
          </div>
          {suggestions.map(s => (
            <SuggestionItem
              key={s.id}
              label={s.label}
              sub={s.sub}
              type={s.type}
              onPick={() => { onChange(s.label); setFocused(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ── Loading / Error screens ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full"
      style={{ background: "radial-gradient(ellipse at 30% 40%, #060e1f 0%, #020811 100%)" }}>
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
          style={{ animation: "spin 1.2s linear infinite" }} />
        <div className="absolute inset-3 rounded-full border-2 border-green-400/20 border-b-green-400"
          style={{ animation: "spin 1.8s linear infinite reverse" }} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">⬡</div>
      </div>
      <p className="text-cyan-400/70 text-sm tracking-widest uppercase font-mono">
        Loading Knowledge Graph…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"
      style={{ background: "radial-gradient(ellipse at 30% 40%, #1a0614 0%, #020811 100%)" }}>
      <div className="text-5xl">⚠</div>
      <p className="text-red-400 font-mono text-sm max-w-xs text-center">{message}</p>
      <button onClick={onRetry}
        className="px-6 py-2 border border-red-400/40 text-red-400 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-red-400/10 transition-colors">
        Retry
      </button>
    </div>
  );
}


// ── Top bar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  limit:       number;
  minSim:      number;
  loading:     boolean;
  searchQuery: string;
  data:        GraphData | null;
  onApply:     (limit: number, minSim: number) => void;
  onSearch:    (q: string) => void;
  onClear:     () => void;
}

function TopBar({ limit, minSim, loading, searchQuery, data, onApply, onSearch, onClear }: TopBarProps) {
  const [localLimit,  setLocalLimit]  = useState(limit);
  const [localMinSim, setLocalMinSim] = useState(minSim);

  const inputStyle: React.CSSProperties = {
    width: 52, background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)", borderRadius: 6,
    padding: "4px 8px", color: "#fff", fontSize: 11,
    fontFamily: "monospace", outline: "none",
  };

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      gap:            16,
      padding:        "10px 20px",
      borderBottom:   "1px solid rgba(255,255,255,0.05)",
      background:     "rgba(2,8,17,0.92)",
      backdropFilter: "blur(16px)",
      zIndex:         100,
      flexShrink:     0,
    }}>
      {/* brand */}
      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#22d3ee", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Paper ↔ Patent
      </span>

      {/* search — centre of top bar */}
      <SearchBar query={searchQuery} onChange={onSearch} onClear={onClear} data={data} />

      <div style={{ flex: 1 }} />

      {/* compact filter inputs */}
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#4a6070", fontFamily: "monospace", textTransform: "uppercase" }}>
        Limit <input type="number" min={1} max={200} value={localLimit}
          onChange={e => setLocalLimit(Number(e.target.value))} style={inputStyle} />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#4a6070", fontFamily: "monospace", textTransform: "uppercase" }}>
        Min Sim <input type="number" min={0} max={1} step={0.05} value={localMinSim}
          onChange={e => setLocalMinSim(Number(e.target.value))} style={inputStyle} />
      </label>

      <button
        onClick={() => onApply(localLimit, localMinSim)}
        disabled={loading}
        style={{
          padding: "6px 14px", background: "rgba(34,211,238,0.08)",
          border: "1px solid rgba(34,211,238,0.28)", borderRadius: 7,
          color: "#22d3ee", fontFamily: "monospace", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.08em", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.4 : 1, textTransform: "uppercase", transition: "all 150ms",
        }}
      >
        {loading ? "…" : "Apply"}
      </button>
    </div>
  );
}


// ── Zero-results overlay ──────────────────────────────────────────────────────

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14, zIndex: 30,
    }}>
      <div style={{ fontSize: 38, opacity: 0.35 }}>🔍</div>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.7 }}>
        No papers or patents matching<br />
        <span style={{ color: "#22d3ee" }}>"{query}"</span>
      </p>
      <button onClick={onClear} style={{
        padding: "6px 16px", background: "transparent",
        border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6,
        color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 11, cursor: "pointer",
      }}>
        Clear search
      </button>
    </div>
  );
}


// ── Main page ─────────────────────────────────────────────────────────────────

const GraphPage: React.FC = () => {
  const [limit,       setLimit]       = useState(50);
  const [minSim,      setMinSim]      = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [data,    setData]    = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdgeState | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadGraph = useCallback(async (lim: number, sim: number) => {
    setLoading(true);
    setError(null);
    setSelectedId(null);
    setSelectedEdge(null);
    setSearchQuery("");
    try {
      const result = await fetchGraphData(lim, sim);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGraph(limit, minSim); }, []); // eslint-disable-line

  const handleApplyFilters = (newLimit: number, newMinSim: number) => {
    setLimit(newLimit);
    setMinSim(newMinSim);
    loadGraph(newLimit, newMinSim);
  };

  // ── Filtered data (client-side, no extra fetch) ────────────────────────────

  const visibleData = useMemo(
    () => (data ? filterGraphBySearch(data, searchQuery) : null),
    [data, searchQuery],
  );

  const noResults =
    !!searchQuery.trim() &&
    !!visibleData &&
    visibleData.total_papers === 0 &&
    visibleData.total_patents === 0;

  // ── Selection ──────────────────────────────────────────────────────────────

  const handleNodeSelect = useCallback((node: GraphNode) => {
    setSelectedId(node.id);
    setSelectedEdge(null);
  }, []);

  const handleEdgeSelect = useCallback((state: SelectedEdgeState) => {
    setSelectedEdge(state);
    setSelectedId(null);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    setSelectedEdge(null);
  }, []);

  const selectedNode = visibleData
    ? ([...visibleData.papers, ...visibleData.patents] as GraphNode[]).find(n => n.id === selectedId) ?? null
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#020811", color: "#fff", overflow: "hidden" }}>

      <TopBar
        limit={limit}
        minSim={minSim}
        loading={loading}
        searchQuery={searchQuery}
        data={data}
        onApply={handleApplyFilters}
        onSearch={q => { setSearchQuery(q); setSelectedId(null); setSelectedEdge(null); }}
        onClear={() => { setSearchQuery(""); setSelectedId(null); setSelectedEdge(null); }}
      />

      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>

        {loading && <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><LoadingScreen /></div>}
        {error && !loading && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
            <ErrorScreen message={error} onRetry={() => loadGraph(limit, minSim)} />
          </div>
        )}

        {/* 3-D canvas uses the filtered dataset */}
        {visibleData && !noResults && (
          <BipartiteGraph3D
            data={visibleData}
            selectedId={selectedId}
            onNodeSelect={handleNodeSelect}
            onNodeInvestigate={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
            onDeselect={handleDeselect}
          />
        )}

        {noResults && <NoResults query={searchQuery} onClear={() => setSearchQuery("")} />}

        {visibleData && <StatsBar data={visibleData} />}
        <Legend />
        <ClickHint hasSelection={!!selectedNode || !!selectedEdge} />

        {selectedNode && !selectedEdge && (
          <NodeInfoPanel node={selectedNode} onClose={handleDeselect} />
        )}

        {selectedEdge && (
          <EdgeInfoPanel
            edge={selectedEdge.edge}
            screenX={selectedEdge.screenX}
            screenY={selectedEdge.screenY}
            onClose={() => setSelectedEdge(null)}
          />
        )}
      </div>
    </div>
  );
};

export default GraphPage;