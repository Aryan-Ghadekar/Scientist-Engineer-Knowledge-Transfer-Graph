"""
graphrep/servic.py
GraphService — owns all Neo4j interaction and graph-layout logic.

Responsibilities:
  1. Run the Cypher query against Neo4j.
  2. Deduplicate Paper and Patent nodes across multiple records.
  3. Compute deterministic 3-D positions (papers on left, patents on right).
  4. Build SimilarityEdge objects and the final GraphData payload.
"""

import math
import logging
from typing import List, Dict, Tuple

from config.db import get_session          # your existing session helper
from .models import (
    RawGraphRecord,
    PaperNode,
    PatentNode,
    SimilarityEdge,
    GraphData,
)



# ── Cypher ────────────────────────────────────────────────────────────────────

BIPARTITE_QUERY = """
MATCH (p:Paper)-[r:SIMILAR_TO]->(pt:Patent)
WHERE r.score >= $min_similarity
RETURN
    p.id          AS paper_id,
    p.title       AS paper_title,
    p.year        AS paper_year,
    pt.title      AS patent_title,
    pt.year       AS patent_year,
    r.score       AS similarity,
    p.novelty     AS novelty
ORDER BY r.score DESC
LIMIT $limit
"""


# ── 3-D layout helpers ────────────────────────────────────────────────────────

def _layout_left(index: int, total: int) -> Tuple[float, float, float]:
    """
    Place papers on the LEFT side (x ≈ -14).
    Nodes are spread vertically with a gentle Z-wave so they don't
    all collapse onto a flat line.
    """
    spread  = max(total - 1, 1)
    y       = (index - spread / 2.0) * 3.8
    z       = math.sin((index / spread) * math.pi * 2) * 3.5
    return (-14.0, y, z)


def _layout_right(index: int, total: int) -> Tuple[float, float, float]:
    """
    Place patents on the RIGHT side (x ≈ +14).
    Same vertical spread, mirrored Z-wave for visual balance.
    """
    spread  = max(total - 1, 1)
    y       = (index - spread / 2.0) * 3.8
    z       = math.cos((index / spread) * math.pi * 2) * 3.5
    return (14.0, y, z)


# ── Core service ──────────────────────────────────────────────────────────────

class GraphService:
    """
    Stateless service — all methods are class-level so callers don't
    need to instantiate anything.
    """

    @classmethod
    def fetch_graph(
        cls,
        limit: int = 50,
        min_similarity: float = 0.0,
    ) -> GraphData:
        """
        Main entry point used by the route handler.

        Returns a fully-assembled GraphData object ready for JSON serialisation.
        """
        raw_records = cls._run_query(limit, min_similarity)
        return cls._build_graph(raw_records)

    # ── private helpers ───────────────────────────────────────────────────────

    @classmethod
    def _run_query(
        cls,
        limit: int,
        min_similarity: float,
    ) -> List[RawGraphRecord]:
        """Execute the Cypher query and parse each row into a RawGraphRecord."""
        records: List[RawGraphRecord] = []

        with get_session() as session:
            result = session.run(
                BIPARTITE_QUERY,
                limit=limit,
                min_similarity=min_similarity,
            )
            for row in result:
                try:
                    records.append(RawGraphRecord(**dict(row)))
                except Exception as exc:
                    pass
        return records

    @classmethod
    def _build_graph(cls, records: List[RawGraphRecord]) -> GraphData:
        """
        Deduplicate nodes, compute 3-D positions, and assemble edges.
        """
        # ── 1. Collect unique papers and patents (preserve insertion order) ──
        paper_map: Dict[str, PaperNode]  = {}
        patent_map: Dict[str, PatentNode] = {}

        for rec in records:
            if rec.paper_id not in paper_map:
                paper_map[rec.paper_id] = PaperNode(
                    id      = rec.paper_id,
                    title   = rec.paper_title or rec.paper_id,
                    year    = rec.paper_year,
                    novelty = rec.novelty,
                )

            # Use title as the patent key (patents may lack a separate ID field)
            patent_key = rec.patent_title or f"patent_{len(patent_map)}"
            if patent_key not in patent_map:
                patent_map[patent_key] = PatentNode(
                    id    = patent_key,
                    title = rec.patent_title or patent_key,
                    year  = rec.patent_year,
                )

        # ── 2. Assign 3-D positions ──────────────────────────────────────────
        papers  = list(paper_map.values())
        patents = list(patent_map.values())

        for i, paper in enumerate(papers):
            paper.x, paper.y, paper.z = _layout_left(i, len(papers))

        for i, patent in enumerate(patents):
            patent.x, patent.y, patent.z = _layout_right(i, len(patents))

        # ── 3. Build edges ───────────────────────────────────────────────────
        edges: List[SimilarityEdge] = []
        seen_edges: set = set()

        for rec in records:
            patent_key = rec.patent_title or f"patent_{len(patent_map)}"
            edge_id = f"{rec.paper_id}--{patent_key}"

            # Guard against duplicate edges from the query result
            if edge_id in seen_edges:
                continue
            seen_edges.add(edge_id)

            edges.append(SimilarityEdge(
                id           = edge_id,
                source       = rec.paper_id,
                target       = patent_key,
                similarity   = rec.similarity,
                source_title = rec.paper_title,
                target_title = rec.patent_title,
            ))

        # ── 4. Summary stats ─────────────────────────────────────────────────
        avg_sim = (
            sum(e.similarity for e in edges) / len(edges)
            if edges else 0.0
        )

        return GraphData(
            papers        = papers,
            patents       = patents,
            edges         = edges,
            total_papers  = len(papers),
            total_patents = len(patents),
            total_edges   = len(edges),
            avg_similarity= round(avg_sim, 4),
        )