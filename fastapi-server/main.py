from fastapi import FastAPI
from routes.gap_routes import gap_router
from routes.dashboard_routes import dashboard_router
from routes.summary_routes import summary_router
from routes.temporal_routes import temporal_router
import os
from fastapi.middleware.cors import CORSMiddleware
from GraphRepresentation.routes import router as graph_router
from GraphCreation.routes import graph_create_router
from auth.routes import router as auth_router
from PatentAPI.routes import patent_router
from PatentAPI.service import lifespan
from Roadmap.routes import roadmap_router

app = FastAPI(lifespan=lifespan)
app.include_router(gap_router, prefix='/api')
app.include_router(dashboard_router, prefix='/api')
app.include_router(summary_router, prefix='/api')
app.include_router(temporal_router, prefix='/api')
app.include_router(graph_router)
app.include_router(graph_create_router, prefix='/api')
app.include_router(auth_router)
app.include_router(patent_router)
app.include_router(roadmap_router)

@app.get("/")
async def health():
    return {"message": "Server is healthy!!!"}

_origins = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    ).split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins     = _origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)