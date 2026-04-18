// Mirrors the Pydantic models from backend/models/graph_models.py
// so the frontend always stays in sync with the API contract.

export interface PaperNode {
  id: string;
  title: string;
  year?: number;
  novelty?: number;
  type: "paper";
  x: number;
  y: number;
  z: number;
}

export interface PatentNode {
  id: string;
  title: string;
  year?: number;
  type: "patent";
  x: number;
  y: number;
  z: number;
}

// Union — useful for panels that handle both node kinds
export type GraphNode = PaperNode | PatentNode;

export interface SimilarityEdge {
  id: string;
  source: string;       // paper_id
  target: string;       // patent_id
  similarity: number;   // 0.0 – 1.0
  source_title?: string;
  target_title?: string;
}

export interface GraphData {
  papers: PaperNode[];
  patents: PatentNode[];
  edges: SimilarityEdge[];
  total_papers: number;
  total_patents: number;
  total_edges: number;
  avg_similarity: number;
}

// ── UI state helpers ──────────────────────────────────────────────────────────

export interface SelectedEdgeState {
  edge: SimilarityEdge;
  screenX: number;
  screenY: number;
}

// Colours that never change — keep them in one place so all components
// can import rather than re-define.
export const PAPER_COLOR  = "#22d3ee";   // cyan  — research papers
export const PATENT_COLOR = "#4ade80";   // green — implementation patents
export const EDGE_BASE    = "#1e3a4c";   // dim teal for unselected edges
export const EDGE_ACTIVE  = "#a5f3fc";   // bright cyan for active edges