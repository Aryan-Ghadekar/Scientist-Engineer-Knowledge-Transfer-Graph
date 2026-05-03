from fastapi import APIRouter, HTTPException
from PatentAPI.service import _run_inference
from .service import save_and_link_paper, get_matches
from .models import PipelineInput
from .service import generate_roadmap, store_in_supabase
import time

roadmap_router = APIRouter(prefix="/api/pipeline", tags=["Roadmap"])


@roadmap_router.post("/analyze")
def analyze_pipeline(paper: dict):

    # ✅ convert dict → Pydantic model
    paper_obj = PipelineInput(**paper)

    # 1. Prediction
    prediction = _run_inference(paper_obj)

    # 2. Save to DB
    store_in_supabase(paper_obj, prediction)

    # 3. Save to Neo4j
    # save_and_link_paper(paper, prediction)

    # # 4. Get matches
    # matches = get_matches(paper.get("title"))

    # 5. Generate roadmap
    roadmap = generate_roadmap(paper_obj)

    return {
        "paper": paper_obj.model_dump(),
        "prediction": prediction,
        # "matches": matches,
        "roadmap": roadmap
    }