import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

log = logging.getLogger("patent_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Patent predictions are served by the HuggingFace Space, so there is nothing to load."""
    yield
