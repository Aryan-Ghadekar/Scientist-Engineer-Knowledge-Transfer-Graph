from pydantic import BaseModel, Field, field_validator

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