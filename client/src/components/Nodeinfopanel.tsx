import React, { useMemo } from "react";
import { GraphNode, PAPER_COLOR, PATENT_COLOR } from "./types/graph.types";

interface NodeInfoPanelProps {
  node: GraphNode;
  onClose: () => void;
  onInvestigate: (node: GraphNode) => void;
}

// Total number of patent images in /photos folder (patent1.jpg … patent9.jpg)
const PATENT_IMAGE_COUNT = 9;

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  node,
  onClose,
  onInvestigate,
}) => {
  const isPaper   = node.type === "paper";
  const accent    = isPaper ? PAPER_COLOR : PATENT_COLOR;
  const typeLabel = isPaper ? "Research Paper" : "Implementation Patent";

  const novelty = isPaper && "novelty" in node ? node.novelty : undefined;

  const noveltyLabel = (v: number) => {
    if (v >= 0.8) return { text: "Highly Novel", color: "#f472b6" };
    if (v >= 0.5) return { text: "Moderate",     color: "#fb923c" };
    return            { text: "Incremental",    color: "#94a3b8" };
  };

  // Pick a random patent image once per node render.
const { randomPatentImage, patentNo } = useMemo(() => {
  if (isPaper) return { randomPatentImage: null, patentNo: null };
  const idx = Math.floor(Math.random() * PATENT_IMAGE_COUNT) + 1;
  const ext = idx === 8 ? "png" : "jpg";
  // Generate a realistic-looking random patent number
  const year  = 2015 + Math.floor(Math.random() * 10);          // 2015–2024
  const serie = Math.floor(Math.random() * 9000000) + 1000000;  // 7-digit
  return {
    randomPatentImage: `/photos/patent${idx}.${ext}`,
    patentNo: `US${year}/${serie}B2`,
  };
}, [node.id, isPaper]);

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
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", wordBreak: "break-all", maxWidth: 220 }}>
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

      {/* ── Patent image (patents only) ── */}
      {!isPaper && randomPatentImage && (
        <div
          style={{
            marginBottom:  16,
            borderRadius:  10,
            overflow:      "hidden",
            border:        `1px solid ${accent}30`,
            position:      "relative",
          }}
        >
          <img
            src={randomPatentImage}
            alt="Patent illustration"
            style={{
              width:      "100%",
              height:     140,
              objectFit:  "cover",
              display:    "block",
            }}
            onError={(e) => {
              // Hide image block if file not found
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
          {/* small badge showing which file was picked */}
          <div
            style={{
              position:   "absolute",
              bottom:     6,
              right:      8,
              fontSize:   9,
              color:      "rgba(255,255,255,0.45)",
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.55)",
              padding:    "2px 6px",
              borderRadius: 4,
            }}
          >
            {randomPatentImage.split("/").pop()}
          </div>
        </div>
      )}

      {/* ── Icon badge ── */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          12,
          marginBottom: 16,
          padding:      "10px 12px",
          background:   `${accent}0a`,
          borderRadius: 10,
          border:       `1px solid ${accent}22`,
        }}
      >
        <div
          style={{
            width:          40,
            height:         40,
            borderRadius:   "50%",
            background:     `${accent}18`,
            border:         `2px solid ${accent}55`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       18,
            flexShrink:     0,
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
        ["Type",  typeLabel,                   accent],
        ["Year",  node.year?.toString() ?? "—", "#7ab8d4"],
        ...(!isPaper && patentNo
        ? [["Patent No.", patentNo, "#a78bfa"]]
        : []),
        ...(novelty !== undefined
          ? [["Novelty Score", novelty.toFixed(3), noveltyLabel(novelty).color]]
          : []),
      ].map(([k, v, c]) => (
        <div
          key={k as string}
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "7px 0",
            borderBottom:   "1px solid rgba(255,255,255,0.05)",
            gap:            12,
          }}
        >
          <span style={{ fontSize: 11, color: "#4a6070", fontWeight: 500 }}>{k as string}</span>
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

      {/* Investigate button */}
      <button
        onClick={() => onInvestigate(node)}
        style={{
          marginTop:     14,
          width:         "100%",
          padding:       "9px 0",
          background:    `${accent}14`,
          border:        `1px solid ${accent}44`,
          borderRadius:  9,
          color:         accent,
          fontSize:      12,
          fontWeight:    700,
          letterSpacing: "0.07em",
          cursor:        "pointer",
        }}
      >
        🔍 INVESTIGATE NODE
      </button>

      <div style={{ marginTop: 8, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>
        OR DOUBLE-CLICK NODE
      </div>
    </div>
  );
};

export default NodeInfoPanel;