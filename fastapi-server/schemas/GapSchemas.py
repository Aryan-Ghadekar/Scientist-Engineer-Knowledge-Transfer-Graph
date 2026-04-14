from pydantic import BaseModel

class Paper(BaseModel):
    paper_id: str
    similarity: float
    novelty: float
    year: int

class GapResponse(BaseModel):
    paper_id: str
    similarity: float
    time_gap: float
    gap_type: str
    probability: float