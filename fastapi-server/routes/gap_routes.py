from fastapi import APIRouter
from services.graph_service import get_papers_with_patents
from services.gap_service import detect_gap, get_top_papers, get_domainwise_analysis, rank_papers

gap_router = APIRouter()

@gap_router.get("/gaps")
def get_gaps():
    data = get_papers_with_patents()
    return [detect_gap(p) for p in data]


@gap_router.get("/top-papers")
def get_top_paper():
    raw = get_papers_with_patents()
    processed = [detect_gap(p) for p in raw]
    return get_top_papers(processed)


@gap_router.get("/domain-analysis")
def get_domain_analysis():
    raw = get_papers_with_patents()
    processed = [detect_gap(p) for p in raw]
    return get_domainwise_analysis(processed)

@gap_router.get("/priority-ranked")
def get_ranked_papers():
    data = get_papers_with_patents()
    rankked_data = rank_papers(data)
    return {
        "total": len(rankked_data),
        "data": rankked_data
    }