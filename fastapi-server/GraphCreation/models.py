from pydantic import BaseModel
from typing import List

class EdgeInput(BaseModel):
    paper_id: str
    paper_title: str
    patent_id: str
    patent_title: str
    similarity: float


class UploadResponse(BaseModel):
    message: str
    nodes_created: int
    relationships_created: int