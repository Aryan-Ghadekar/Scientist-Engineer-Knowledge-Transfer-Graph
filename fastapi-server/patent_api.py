"""
Patent Probability Predictor — FastAPI Endpoint
================================================
Wraps the trained v4 model artefacts in a production-ready REST API.

SETUP
─────
pip install fastapi uvicorn joblib scikit-learn numpy pandas

QUICKSTART
──────────
# 1. Train the model first (produces outputs/ artefacts):
#    python patent_predictor_v4.py

# 2. Start the API server:
#    uvicorn patent_api:app --host 0.0.0.0 --port 8000 --reload

# 3. Interactive docs:
#    http://localhost:8000/docs      ← Swagger UI
#    http://localhost:8000/redoc     ← ReDoc

ENDPOINTS
─────────
POST /predict          — predict from full structured + text input
POST /predict/text     — predict from title + abstract only (minimal mode)
POST /predict/batch    — predict multiple papers in one call
GET  /health           — liveness check + model metadata
GET  /model/info       — model metrics, thresholds, feature list
"""

import os
import re
import time
import logging
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Optional

import numpy as np
import pandas as pd
import joblib

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("patent_api")

# ── Artefact paths (override via env vars for Docker / cloud deploy) ─────────
MODEL_PATH  = os.getenv("MODEL_PATH",  "outputs/patent_predictor_v4.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "outputs/patent_scaler_v4.pkl")
TFIDF_PATH  = os.getenv("TFIDF_PATH",  "outputs/patent_tfidf_v4.pkl")
SVD_PATH    = os.getenv("SVD_PATH",    "outputs/patent_svd_v4.pkl")
META_PATH   = os.getenv("META_PATH",   "outputs/patent_meta_v4.pkl")

# ── Global artefact store ────────────────────────────────────────────────────
ARTS: dict = {}

# ══════════════════════════════════════════════════════════════
# STARTUP / SHUTDOWN
# ══════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model artefacts once at startup; release on shutdown."""
    log.info("Loading model artefacts ...")
    for path in [MODEL_PATH, SCALER_PATH, TFIDF_PATH, SVD_PATH, META_PATH]:
        if not os.path.exists(path):
            raise RuntimeError(
                f"Artefact not found: {path}\n"
                "Run  python patent_predictor_v4.py  first to train and save the model."
            )
    ARTS["model"]  = joblib.load(MODEL_PATH)
    ARTS["scaler"] = joblib.load(SCALER_PATH)
    ARTS["tfidf"]  = joblib.load(TFIDF_PATH)
    ARTS["svd"]    = joblib.load(SVD_PATH)
    ARTS["meta"]   = joblib.load(META_PATH)
    ARTS["meta"]["threshold"] = 0.6
    log.info("✓ Model artefacts loaded successfully.")
    yield
    ARTS.clear()
    log.info("Artefacts released.")


# ══════════════════════════════════════════════════════════════
# APP
# ══════════════════════════════════════════════════════════════
app = FastAPI(
    title="Research Paper → Patent Probability API",
    description=(
        "Given a research paper's text and/or metadata, returns the probability "
        "that the paper will be cited in a future patent, along with confidence "
        "tier, key feature drivers, and an interpretive explanation."
    ),
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════
# REQUEST / RESPONSE SCHEMAS
# ══════════════════════════════════════════════════════════════
class PaperInput(BaseModel):
    """Full input schema — text fields + optional structured metadata."""

    # ── Text (at least one should be provided) ───────────────
    title:    str = Field(default="", description="Paper title")
    abstract: str = Field(default="", description="Paper abstract (most important field)")
    keywords: str = Field(default="", description="Comma-separated keywords")

    # ── Structured metadata (all optional) ───────────────────
    year:            int   = Field(default=2005, ge=1900, le=2100, description="Publication year")
    cited:           int   = Field(default=0,    ge=0,              description="Citation count")
    novelty:         float = Field(default=0.0,  ge=0.0, le=1.0,   description="Novelty score 0–1")
    source:          str   = Field(default="unknown",               description="Journal / venue")
    past_patent_cnt: int   = Field(default=0,    ge=0,              description="# past patents referencing this paper")
    avg_past_sim:    float = Field(default=0.0,  ge=0.0, le=1.0,   description="Avg similarity to past patents")
    max_past_sim:    float = Field(default=0.0,  ge=0.0, le=1.0,   description="Max similarity to past patents")

    @field_validator("title", "abstract", "keywords", "source", mode="before")
    @classmethod
    def coerce_str(cls, v):
        return str(v) if v is not None else ""

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title":    "CRISPR-Cas9 gene editing for sickle cell disease therapy",
                    "abstract": "We develop a CRISPR-Cas9 based therapeutic approach to correct the HbS mutation in patient-derived haematopoietic stem cells. In-vivo mouse models show 80% correction efficiency with minimal off-target effects.",
                    "keywords": "CRISPR, gene editing, sickle cell, stem cells, therapy",
                    "year":     2006,
                    "cited":    210,
                    "novelty":  0.88,
                    "source":   "Nature Medicine",
                }
            ]
        }
    }


class TextOnlyInput(BaseModel):
    """Minimal input — title + abstract + optional keywords only."""
    title:    str = Field(default="", description="Paper title")
    abstract: str = Field(...,        description="Paper abstract")
    keywords: str = Field(default="", description="Comma-separated keywords")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title":    "Deep learning for drug discovery",
                    "abstract": "We present a graph neural network that predicts molecular binding affinities with state-of-the-art accuracy on benchmark datasets.",
                    "keywords": "drug discovery, GNN, molecular property prediction",
                }
            ]
        }
    }


class PredictionResponse(BaseModel):
    probability:    float
    prediction:     int
    confidence:     str
    label:          str
    top_drivers:    list[str]
    interpretation: str
    # threshold_used: float
    latency_ms:     float


class BatchInput(BaseModel):
    papers: list[PaperInput] = Field(..., min_length=1, max_length=100)


class BatchResponse(BaseModel):
    count:       int
    results:     list[PredictionResponse]
    total_ms:    float


# ══════════════════════════════════════════════════════════════
# CORE INFERENCE LOGIC
# ══════════════════════════════════════════════════════════════
def clean_text(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _run_inference(paper: PaperInput) -> dict:
    """Build feature vector and return prediction dict."""
    meta         = ARTS["meta"]
    model        = ARTS["model"]
    scaler       = ARTS["scaler"]
    tfidf        = ARTS["tfidf"]
    svd          = ARTS["svd"]

    threshold    = meta["threshold"]
    cutoff       = meta["cutoff_year"]
    bot_sim      = meta.get("bot_sim", 0.34)
    le           = meta["label_encoder"]
    struct_feats = meta["struct_features"]

    # ── Structured features ──────────────────────────────────
    age = max(cutoff - paper.year, 0)

    if le is not None:
        try:   domain_enc = int(le.transform([paper.source])[0])
        except ValueError: domain_enc = 0
    else:
        domain_enc = 0

    kws = [k.strip() for k in paper.keywords.split(",") if k.strip()]

    struct_row = {
        "novelty":           paper.novelty,
        "novelty_bin":       float(int(pd.cut(
                                 [paper.novelty],
                                 bins=[-np.inf, 0, 0.25, 0.5, 0.75, np.inf],
                                 labels=[0, 1, 2, 3, 4]
                             )[0])),
        "domain_encoded":    domain_enc,
        "age_at_cutoff":     age,
        "is_recent":         int(age <= 5),
        "cited_log":         np.log1p(paper.cited),
        "cited_log_rate":    np.log1p(paper.cited / max(age, 1)),
        "past_patent_log":   np.log1p(paper.past_patent_cnt),
        "avg_past_sim":      paper.avg_past_sim,
        "max_past_sim":      paper.max_past_sim,
        "has_past_patent":   int(paper.max_past_sim >= bot_sim),
        "keyword_count":     len(kws),
        "keyword_diversity": len(set(k.lower() for k in kws)),
        "abstract_words":    len(paper.abstract.split()),
    }
    X_struct = np.array([[struct_row[f] for f in struct_feats]])

    # ── Text features ─────────────────────────────────────────
    blob    = clean_text(f"{paper.title} {paper.abstract} {paper.keywords}")
    X_tfidf = tfidf.transform([blob])
    X_text  = svd.transform(X_tfidf)

    # ── Combine + scale ───────────────────────────────────────
    X = scaler.transform(np.hstack([X_struct, X_text]))

    # ── Predict ───────────────────────────────────────────────
    prob = float(model.predict_proba(X)[0, 1])
    pred = int(prob > threshold)

    # ── Confidence tier ───────────────────────────────────────
    if prob >= 0.75:    confidence = "High"
    elif prob >= 0.50:  confidence = "Medium"
    elif prob >= 0.30:  confidence = "Low-Medium"
    else:               confidence = "Low"

    # ── Top structural drivers ────────────────────────────────
    base_model  = model.calibrated_classifiers_[0].estimator
    importances = base_model.feature_importances_[:len(struct_feats)]
    top_idx     = np.argsort(importances)[::-1][:3]
    top_drivers = [struct_feats[i] for i in top_idx]

    # ── Interpretation ────────────────────────────────────────
    if prob >= 0.70:
        interp = (
            f"Strong signal ({prob:.0%}) — this paper closely matches the profile of "
            "research that transitions into patents. High novelty, citation momentum, "
            "or strong semantic overlap with existing patents is driving this score."
        )
    elif prob >= 0.45:
        interp = (
            f"Moderate signal ({prob:.0%}) — some patent-relevant characteristics "
            "detected. Strengthening applied/technical claims may push this higher."
        )
    else:
        interp = (
            f"Weak signal ({prob:.0%}) — current profile suggests limited patent "
            "translation potential. Focus on commercialisable aspects and industrial relevance."
        )

    return {
        "probability":    round(prob, 4),
        "prediction":     pred,
        "confidence":     confidence,
        "label":          "Likely to become a patent" if pred else "Unlikely to become a patent",
        "top_drivers":    top_drivers,
        "interpretation": interp,
        # "threshold_used": round(threshold, 2),
    }


# ══════════════════════════════════════════════════════════════
# MIDDLEWARE — request timing
# ══════════════════════════════════════════════════════════════
@app.middleware("http")
async def add_latency_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    response.headers["X-Latency-Ms"] = f"{ms:.1f}"
    return response


# ══════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/health", tags=["System"])
def health():
    """Liveness check — returns model version and cutoff year."""
    meta = ARTS.get("meta", {})
    return {
        "status":      "ok",
        "model":       "patent_predictor_v4",
        "cutoff_year": meta.get("cutoff_year"),
        # "threshold":   meta.get("threshold"),
        "artefacts_loaded": len(ARTS) == 5,
    }


@app.get("/model/info", tags=["System"])
def model_info():
    """Full model metadata: features, thresholds, and test-set metrics."""
    meta = ARTS.get("meta", {})
    return {
        "struct_features": meta.get("struct_features", []),
        "svd_components":  meta.get("svd_components"),
        "top_sim_threshold": meta.get("top_sim"),
        "bot_sim_threshold": meta.get("bot_sim"),
        # "decision_threshold": meta.get("threshold"),
        "cutoff_year":     meta.get("cutoff_year"),
        "test_metrics":    meta.get("test_metrics", {}),
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(paper: PaperInput):
    """
    **Full prediction** — accepts all structured metadata alongside text.

    Provide as much of `title`, `abstract`, and `keywords` as possible for
    best accuracy. Structured fields (`year`, `cited`, `novelty`, etc.) are
    optional but improve predictions when available.
    """
    if not paper.title and not paper.abstract and not paper.keywords:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of: title, abstract, keywords."
        )
    t0     = time.perf_counter()
    result = _run_inference(paper)
    result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 2)
    log.info(
        f"/predict  prob={result['probability']:.3f}  "
        f"conf={result['confidence']}  {result['latency_ms']}ms"
    )
    return result


@app.post("/predict/text", response_model=PredictionResponse, tags=["Prediction"])
def predict_text(inp: TextOnlyInput):
    """
    **Text-only prediction** — supply just title, abstract, and keywords.

    All structured metadata (year, citations, novelty, etc.) default to zero.
    Ideal for quickly screening papers when only the text is available.
    """
    paper = PaperInput(
        title=inp.title,
        abstract=inp.abstract,
        keywords=inp.keywords,
    )
    t0     = time.perf_counter()
    result = _run_inference(paper)
    result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 2)
    log.info(
        f"/predict/text  prob={result['probability']:.3f}  "
        f"conf={result['confidence']}  {result['latency_ms']}ms"
    )
    return result


@app.post("/predict/batch", response_model=BatchResponse, tags=["Prediction"])
def predict_batch(batch: BatchInput):
    """
    **Batch prediction** — submit up to 100 papers in a single request.

    Each paper uses the same full schema as `/predict`.
    Results are returned in the same order as the input list.
    """
    t0      = time.perf_counter()
    results = []
    for paper in batch.papers:
        t1     = time.perf_counter()
        result = _run_inference(paper)
        result["latency_ms"] = round((time.perf_counter() - t1) * 1000, 2)
        results.append(result)

    total_ms = round((time.perf_counter() - t0) * 1000, 2)
    log.info(f"/predict/batch  n={len(results)}  total={total_ms}ms")
    return {"count": len(results), "results": results, "total_ms": total_ms}


# ══════════════════════════════════════════════════════════════
# GLOBAL ERROR HANDLER
# ══════════════════════════════════════════════════════════════
@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    log.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check server logs."},
    )


# ══════════════════════════════════════════════════════════════
# LOCAL DEV ENTRY POINT
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("patent_api:app", host="0.0.0.0", port=8000, reload=True)