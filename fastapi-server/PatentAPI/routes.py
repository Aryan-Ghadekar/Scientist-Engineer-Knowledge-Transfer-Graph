import time
import logging

from fastapi import HTTPException, APIRouter

from .models import PaperInput, PredictionResponse, TextOnlyInput, BatchInput, BatchResponse
from .HuggingFace.patent_model_client import predict_patent, get_client

patent_router = APIRouter(prefix="/api/model_predict", tags=["Model"])

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("patent_api")

# ══════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════

@patent_router.get("/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "model": "patent_predictor_v4",
        "provider": "huggingface_space",
    }


@patent_router.get("/model/info", tags=["System"])
def model_info():
    return {
        "model": "patent_predictor_v4",
        "provider": "huggingface_space",
    }


@patent_router.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
)
def predict(paper: PaperInput):

    log.info(f"[/predict] Incoming request: title={paper.title!r}")

    try:
        log.info("[/predict] Getting HF client...")
        client = get_client()
        log.info(f"[/predict] Client obtained: {client}")

        log.info("[/predict] Calling client.predict()...")
        t0 = time.perf_counter()

        result = predict_patent(
            title=paper.title,
            abstract=paper.abstract,
            keywords=paper.keywords,
            year=paper.year,
            cited=paper.cited,
            novelty=paper.novelty,
            source=paper.source,
            past_patent_cnt=paper.past_patent_cnt,
            avg_past_sim=paper.avg_past_sim,
            max_past_sim=paper.max_past_sim,
        )

        elapsed = time.perf_counter() - t0
        log.info(f"[/predict] Success in {elapsed:.2f}s. Result: {result}")

        return result

    except Exception as exc:
        log.error(f"[/predict] FAILED with exception type: {type(exc).__name__}")
        log.error(f"[/predict] Exception message: {str(exc)}")
        log.exception("[/predict] Full traceback below:")

        raise HTTPException(
            status_code=502,
            detail="Patent prediction service is unavailable.",
        ) from exc


@patent_router.post(
    "/predict/text",
    response_model=PredictionResponse,
    tags=["Prediction"],
)
def predict_text(inp: TextOnlyInput):

    try:
        result = predict_patent(
            title=inp.title,
            abstract=inp.abstract,
            keywords=inp.keywords,
            year=2005,
            cited=0,
            novelty=0.0,
            source="unknown",
            past_patent_cnt=0,
            avg_past_sim=0.0,
            max_past_sim=0.0,
        )

        return result

    except Exception as exc:
        log.exception("Patent model request failed")

        raise HTTPException(
            status_code=502,
            detail="Patent prediction service is unavailable.",
        ) from exc


@patent_router.post(
    "/predict/batch",
    response_model=BatchResponse,
    tags=["Prediction"],
)
def predict_batch(batch: BatchInput):

    t0 = time.perf_counter()
    results = []

    try:
        for paper in batch.papers:

            t1 = time.perf_counter()

            result = predict_patent(
                title=paper.title,
                abstract=paper.abstract,
                keywords=paper.keywords,
                year=paper.year,
                cited=paper.cited,
                novelty=paper.novelty,
                source=paper.source,
                past_patent_cnt=paper.past_patent_cnt,
                avg_past_sim=paper.avg_past_sim,
                max_past_sim=paper.max_past_sim,
            )

            result["latency_ms"] = round(
                (time.perf_counter() - t1) * 1000,
                2,
            )

            results.append(result)

    except Exception as exc:

        log.exception("Patent batch prediction request failed")

        raise HTTPException(
            status_code=502,
            detail="Patent prediction service is unavailable.",
        ) from exc

    total_ms = round(
        (time.perf_counter() - t0) * 1000,
        2,
    )

    return {
        "count": len(results),
        "results": results,
        "total_ms": total_ms,
    }


# ══════════════════════════════════════════════════════════════
# GLOBAL ERROR HANDLER
# ══════════════════════════════════════════════════════════════
# @patent_router.exception_handler(Exception)
# async def generic_error_handler(request: Request, exc: Exception):
#     log.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
#     return JSONResponse(
#         status_code=500,
#         content={"detail": "Internal server error. Check server logs."},
#     )