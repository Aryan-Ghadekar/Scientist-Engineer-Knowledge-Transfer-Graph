from pydantic import BaseModel 
from typing import Optional 
class PipelineInput(BaseModel):
    title: str 
    abstract: Optional[str] = "" 
    year: Optional[int] = 2000 
    cited: Optional[int] = 0 
    novelty: Optional[float] = 0.0 
    source: Optional[str] = "unknown" 
    keywords: Optional[str] = "" # ✅ ADD THIS