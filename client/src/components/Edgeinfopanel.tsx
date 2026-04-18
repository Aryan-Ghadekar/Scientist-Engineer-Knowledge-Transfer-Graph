import React from "react";
import { SimilarityEdge, PAPER_COLOR, PATENT_COLOR } from "./types/graph.types";

interface EdgeInfoPopupProps {
  edge: SimilarityEdge;
  screenX: number;
  screenY: number;
  onClose: () => void;
}

/**
 * EdgeInfoPopup — a small floating card that appears where the user clicked
 * on a SIMILAR_TO edge, showing the similarity score and both endpoints.
 */
const EdgeInfoPopup: React.FC<EdgeInfoPopupProps> = ({
  edge,
  screenX,
  screenY,
  onClose,
}) => {
  // Similarity strength — drives accent colour
  const sim    = edge.similarity;
  const accent =
    sim >= 0.8 ? "#f472b6" :   // very high → pink
    sim >= 0.6 ? "#fb923c" :   // high      → orange
    sim >= 0.4 ? "#facc15" :   // medium    → yellow
                 "#94a3b8";    // low       → grey

  const strengthLabel =
    sim >= 0.8 ? "Very High" :
    sim >= 0.6 ? "High"      :
    sim >= 0.4 ? "Moderate"  :
                 "Low";

  // Keep popup inside viewport
  const vw   = typeof window !== "undefined" ? window.innerWidth  : 1200;
  const vh   = typeof window !== "undefined" ? window.innerHeight : 800;
  const left = Math.min(screenX + 14, vw - 310);
  const top  = Math.min(screenY - 20, vh - 280);

  return (
    <div
      style={{
        position:       "fixed",
        left,
        top,
        width:          295,
        background:     "rgba(4, 9, 20, 0.97)",
        border:         `1px solid ${accent}44`,
        borderTop:      `2px solid ${accent}`,
        borderRadius:   12,
        padding:        "14px 16px",
        fontFamily:     "Inter, system-ui, sans-serif",
        backdropFilter: "blur(22px)",
        boxShadow:      `0 0 40px ${accent}18, 0 20px 60px rgba(0,0,0,0.85)`,
        zIndex:         9999,
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: `${accent}cc`, textTransform: "uppercase" }}>
            Similarity Edge
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", marginTop: 2 }}>
            {edge.id}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a6070", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>
          ×
        </button>
      </div>

      {/* ── Score — big focal point ── */}
      <div
        style={{
          textAlign:    "center",
          padding:      "12px 0 14px",
          borderBottom: `1px solid ${accent}22`,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize:   32,
            fontWeight: 800,
            color:      accent,
            letterSpacing: "0.02em",
            textShadow: `0 0 24px ${accent}66`,
          }}
        >
          {(sim * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
          Similarity Score
        </div>

        {/* Arrow showing direction */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 9, color: PAPER_COLOR, fontWeight: 700, fontFamily: "monospace", maxWidth: 100, textAlign: "right", wordBreak: "break-word" }}>
            {edge.source_title || edge.source}
          </span>
          <span style={{ fontSize: 14, color: `${accent}88` }}>→</span>
          <span style={{ fontSize: 9, color: PATENT_COLOR, fontWeight: 700, fontFamily: "monospace", maxWidth: 100, textAlign: "left", wordBreak: "break-word" }}>
            {edge.target_title || edge.target}
          </span>
        </div>
      </div>

      {/* ── Detail rows ── */}
      {[
        ["Strength",   strengthLabel,  accent],
        ["Paper ID",   edge.source,    PAPER_COLOR],
        ["Patent ID",  edge.target,    PATENT_COLOR],
      ].map(([k, v, c]) => (
        <div
          key={k}
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "5px 0",
            borderBottom:   "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span style={{ fontSize: 10, color: "#4a6070", fontWeight: 500 }}>{k}</span>
          <span style={{ fontSize: 11, color: c as string, fontWeight: 600, wordBreak: "break-all", textAlign: "right", maxWidth: 180 }}>
            {v as string}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EdgeInfoPopup;