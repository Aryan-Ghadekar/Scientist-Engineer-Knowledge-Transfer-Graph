import React from "react";
import { GraphData, PAPER_COLOR, PATENT_COLOR } from "./types/graph.types";

// ── Stats bar (top-centre) ────────────────────────────────────────────────────

interface StatsBarProps {
  data: GraphData;
}

export const StatsBar: React.FC<StatsBarProps> = ({ data }) => {
  const stats: [number, string, string][] = [
    [data.total_papers,            "Papers",          PAPER_COLOR],
    [data.total_patents,           "Patents",         PATENT_COLOR],
    [data.total_edges,             "Connections",     "#818cf8"],
    [Math.round(data.avg_similarity * 100), "Avg Sim %",  "#fb923c"],
  ];

  return (
    <div
      style={{
        position:       "absolute",
        top:            20,
        left:           "50%",
        transform:      "translateX(-50%)",
        display:        "flex",
        gap:            2,
        background:     "rgba(4,9,20,0.84)",
        border:         "1px solid rgba(255,255,255,0.07)",
        borderRadius:   12,
        padding:        "4px",
        fontFamily:     "Inter, system-ui, sans-serif",
        backdropFilter: "blur(16px)",
        zIndex:         10,
        whiteSpace:     "nowrap",
      }}
    >
      {stats.map(([val, label, color]) => (
        <div key={label} style={{ padding: "6px 14px", borderRadius: 8, textAlign: "center", minWidth: 64 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
          <div style={{ fontSize: 8, color: "#3a5a70", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};


// ── Legend (bottom-left) ──────────────────────────────────────────────────────

export const Legend: React.FC = () => (
  <div
    style={{
      position:       "absolute",
      bottom:         20,
      left:           20,
      background:     "rgba(4,9,20,0.82)",
      border:         "1px solid rgba(255,255,255,0.07)",
      borderRadius:   12,
      padding:        "12px 16px",
      fontFamily:     "Inter, system-ui, sans-serif",
      backdropFilter: "blur(16px)",
      zIndex:         10,
    }}
  >
    <div style={{ fontSize: 9, fontWeight: 700, color: "#3a5a70", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
      Node Types
    </div>

    {[
      [PAPER_COLOR,  "Research Paper",          "◉"],
      [PATENT_COLOR, "Implementation Patent",   "◉"],
    ].map(([c, label, icon]) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 10, color: c as string, textShadow: `0 0 6px ${c}` }}>{icon as string}</span>
        <span style={{ fontSize: 10, color: "#5a7a8a" }}>{label as string}</span>
      </div>
    ))}

    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

    <div style={{ fontSize: 9, fontWeight: 700, color: "#3a5a70", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
      Edge Strength
    </div>
    {[
      ["#f472b6", "≥ 80% — Very High"],
      ["#fb923c", "≥ 60% — High"],
      ["#facc15", "≥ 40% — Moderate"],
      ["#94a3b8", "< 40%  — Low"],
    ].map(([c, label]) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div style={{ width: 20, height: 2, background: c as string, borderRadius: 2, boxShadow: `0 0 4px ${c}88` }} />
        <span style={{ fontSize: 10, color: "#5a7a8a" }}>{label as string}</span>
      </div>
    ))}
  </div>
);


// ── Click hint (bottom-right) ─────────────────────────────────────────────────

interface ClickHintProps { hasSelection: boolean }

export const ClickHint: React.FC<ClickHintProps> = ({ hasSelection }) => {
  if (hasSelection) return null;
  return (
    <div
      style={{
        position:   "absolute",
        bottom:     20,
        right:      20,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize:   10,
        color:      "rgba(255,255,255,0.18)",
        letterSpacing: "0.08em",
        textAlign:  "right",
        userSelect: "none",
        lineHeight: 1.7,
        zIndex:     10,
      }}
    >
      CLICK NODE — Details panel<br />
      DOUBLE CLICK — AI investigation<br />
      CLICK EDGE — Similarity info<br />
      DRAG — Rotate · SCROLL — Zoom
    </div>
  );
};