from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.gap_service import detect_gap

dashboard_router = APIRouter()

@dashboard_router.get("/dashboard")
def dashboard():
    data = get_papers_with_patents()
    gaps = [detect_gap(p) for p in data]

    return {
        "total_papers": len(gaps),
        "top_gaps": sorted(gaps, key=lambda x: x["probability"], reverse=True)[:10]
    }