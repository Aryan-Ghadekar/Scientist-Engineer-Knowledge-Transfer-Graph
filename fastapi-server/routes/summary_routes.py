from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.gap_service import detect_gap, get_summary

summary_router = APIRouter()

@summary_router.get("/summary")
def summary():
    data = get_papers_with_patents()
    gaps = [detect_gap(p) for p in data]
    return get_summary(gaps)