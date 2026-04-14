from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.gap_service import detect_gap

gap_router = APIRouter()

@gap_router.get("/gaps")
def get_gaps():
    data = get_papers_with_patents()

    results = []
    for paper in data:
        results.append(detect_gap(paper))

    return results