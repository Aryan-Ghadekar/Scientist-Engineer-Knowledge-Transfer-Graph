import React from "react";
import { GraphNode, PAPER_COLOR, PATENT_COLOR } from "./types/graph.types";

interface NodeInfoPanelProps {
  node: GraphNode;
  onClose: () => void;
  onInvestigate: (node: GraphNode) => void;
}

/**
 * NodeInfoPanel — slides in from the right when the user clicks any node.
 *
 * Papers are accented in cyan, patents in green, so the user immediately
 * knows which side of the bipartite graph they are inspecting.
 */
const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  node,
  onClose,
  onInvestigate,
}) => {
  const isPaper = node.type === "paper";
  const accent  = isPaper ? PAPER_COLOR : PATENT_COLOR;
  const typeLabel = isPaper ? "Research Paper" : "Implementation Patent";

  // Paper-specific fields (novelty only exists on papers)
  const novelty = isPaper && "novelty" in node ? node.novelty : undefined;

  const noveltyLabel = (v: number) => {
    if (v >= 0.8) return { text: "Highly Novel", color: "#f472b6" };
    if (v >= 0.5) return { text: "Moderate",     color: "#fb923c" };
    return            { text: "Incremental",    color: "#94a3b8" };
  };

  return (
    <div
      style={{
        position:       "absolute",
        top:            20,
        right:          20,
        width:          300,
        background:     "rgba(4, 9, 20, 0.97)",
        border:         `1px solid ${accent}33`,
        borderTop:      `2.5px solid ${accent}`,
        borderRadius:   14,
        padding:        "18px 20px 20px",
        fontFamily:     "Inter, system-ui, sans-serif",
        backdropFilter: "blur(24px)",
        boxShadow:      `0 0 50px ${accent}12, 0 24px 60px rgba(0,0,0,0.8)`,
        zIndex:         20,
        maxHeight:      "82vh",
        overflowY:      "auto",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: `${accent}cc`, textTransform: "uppercase", marginBottom: 4 }}>
            {typeLabel}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "monospace",
              wordBreak: "break-all",
              maxWidth: 220,
            }}
          >
            {node.id}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#4a6070", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0, marginTop: -2 }}
        >
          ×
        </button>
      </div>

      {/* ── Icon badge ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            12,
          marginBottom:   16,
          padding:        "10px 12px",
          background:     `${accent}0a`,
          borderRadius:   10,
          border:         `1px solid ${accent}22`,
        }}
      >
        <div
          style={{
            width:        40,
            height:       40,
            borderRadius: "50%",
            background:   `${accent}18`,
            border:       `2px solid ${accent}55`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     18,
            flexShrink:   0,
          }}
        >
          {isPaper ? "📄" : "📋"}
        </div>
        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, lineHeight: 1.4 }}>
          {node.title}
        </div>
      </div>

      {/* ── Data rows ── */}
      {[
        ["Type",      typeLabel,                   accent],
        ["Year",      node.year?.toString() ?? "—", "#7ab8d4"],
        ...(novelty !== undefined
          ? [["Novelty Score", novelty.toFixed(3), noveltyLabel(novelty).color]]
          : []),
      ].map(([k, v, c]) => (
        <div
          key={k}
          style={{
            display:       "flex",
            justifyContent: "space-between",
            alignItems:    "center",
            padding:       "7px 0",
            borderBottom:  "1px solid rgba(255,255,255,0.05)",
            gap:           12,
          }}
        >
          <span style={{ fontSize: 11, color: "#4a6070", fontWeight: 500 }}>{k}</span>
          <span style={{ fontSize: 12, color: c as string, fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>
            {v as string}
          </span>
        </div>
      ))}

      {/* Novelty badge (papers only) */}
      {novelty !== undefined && (
        <div
          style={{
            marginTop:    10,
            padding:      "6px 10px",
            background:   `${noveltyLabel(novelty).color}12`,
            border:       `1px solid ${noveltyLabel(novelty).color}33`,
            borderRadius: 8,
            textAlign:    "center",
          }}
        >
          <span style={{ fontSize: 10, color: noveltyLabel(novelty).color, fontWeight: 700, letterSpacing: "0.08em" }}>
            {noveltyLabel(novelty).text.toUpperCase()}
          </span>
        </div>
      )}
      <div style={{ marginTop: 8, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>
        OR DOUBLE-CLICK NODE
      </div>
    </div>
  );
};

export default NodeInfoPanel;