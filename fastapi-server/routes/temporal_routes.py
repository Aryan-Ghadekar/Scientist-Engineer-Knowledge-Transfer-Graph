from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.temporal_service import get_temporal_analysis

temporal_router = APIRouter()

@temporal_router.get("/temporal-analysis")
def temporal():
    data = get_papers_with_patents()
    return get_temporal_analysis(data)