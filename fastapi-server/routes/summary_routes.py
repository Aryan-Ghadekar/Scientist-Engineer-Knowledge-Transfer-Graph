from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.gap_service import detect_gap
from services.gap_service import get_summary

summary_router = APIRouter()

@summary_router.get('/summary')
def get_summary_():
    data = get_papers_with_patents()

    gaps = [detect_gap(p) for p in data]

    results = []
    results.append(get_summary(gaps))
    return results