"""
Pydantic models for the Paper ↔ Patent bipartite graph.
All data shapes that travel between Neo4j → service → route → frontend
live here so they stay in one authoritative place.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List


# ── Raw record returned by Neo4j ──────────────────────────────────────────────

class RawGraphRecord(BaseModel):
    """Mirrors the exact columns returned by the Cypher MATCH query."""
    paper_id: str
    paper_title: str
    paper_year: Optional[int] = None
    patent_title: str
    patent_year: Optional[int] = None
    similarity: float
    novelty: Optional[float] = None


# ── Nodes ──────────────────────────────────────────────────────────────────────

class PaperNode(BaseModel):
    """A research paper — rendered as a CYAN node on the left hemisphere."""
    id: str
    title: str
    year: Optional[int] = None
    novelty: Optional[float] = None
    type: Literal["paper"] = "paper"
    # 3-D layout position computed server-side
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


class PatentNode(BaseModel):
    """An implementation patent — rendered as a GREEN node on the right hemisphere."""
    id: str
    title: str
    year: Optional[int] = None
    type: Literal["patent"] = "patent"
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


# ── Edges ─────────────────────────────────────────────────────────────────────

class SimilarityEdge(BaseModel):
    """Directed SIMILAR_TO relationship between a Paper and a Patent."""
    id: str                          # synthetic "{paper_id}--{patent_id}"
    source: str                      # paper_id
    target: str                      # patent_id
    similarity: float                # 0.0 – 1.0
    # Denormalised titles for quick display in the edge popup
    source_title: Optional[str] = None
    target_title: Optional[str] = None


# ── Graph response payload ────────────────────────────────────────────────────

class GraphData(BaseModel):
    """
    Complete bipartite graph payload sent to the frontend.
    The frontend only needs this one object to render the 3-D scene.
    """
    papers: List[PaperNode]
    patents: List[PatentNode]
    edges: List[SimilarityEdge]
    total_papers: int
    total_patents: int
    total_edges: int
    avg_similarity: float            # useful for the stats bar


# ── Filter / query params ─────────────────────────────────────────────────────

class GraphQueryParams(BaseModel):
    """Optional filters the client can send via query-string."""
    limit: int = Field(default=50, ge=1, le=200)
    min_similarity: float = Field(default=0.0, ge=0.0, le=1.0)