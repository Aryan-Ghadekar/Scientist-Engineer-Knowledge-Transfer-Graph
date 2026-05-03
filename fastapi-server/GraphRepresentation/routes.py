"""
graphrepresentation/routes.py
Graph routes — thin HTTP layer.

Only concerns:
  • validate query params
  • call GraphService
  • return JSON

Business logic lives in GraphService, data shapes in graph_models.
"""

import logging
from fastapi import APIRouter, HTTPException, Query

from .models import GraphData
from .service import GraphService


router = APIRouter(prefix="/api/graph", tags=["Graph"])


@router.get(
    "/bipartite",
    response_model=GraphData,
    summary="Fetch Paper → Patent bipartite graph",
    description=(
        "Returns all Paper nodes, Patent nodes, and their SIMILAR_TO edges "
        "with 3-D layout positions pre-computed for the frontend."
    ),
)
def get_bipartite_graph(
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
        description="Maximum number of SIMILAR_TO relationships to return.",
    ),
    min_similarity: float = Query(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Only include edges with similarity ≥ this threshold.",
    ),
) -> GraphData:
    """
    GET /api/graph/bipartite?limit=50&min_similarity=0.5
    """
    try:
        data = GraphService.fetch_graph(
            limit=limit,
            min_similarity=min_similarity,
        )
        
        return data

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/health",
    summary="Health-check for the graph service",
)
def health_check():
    """Quick ping to confirm the route is registered and reachable."""
    return {"status": "ok", "service": "graph-representation"}