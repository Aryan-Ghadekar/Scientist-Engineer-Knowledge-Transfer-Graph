from fastapi import FastAPI
from routes.gap_routes import gap_router
from routes.dashboard_routes import dashboard_router
from routes.summary_routes import summary_router

app = FastAPI()
app.include_router(gap_router, prefix='/api')
app.include_router(dashboard_router, prefix='/api')
app.include_router(summary_router, prefix='/api')

@app.get("/")
async def health():
    return {"message": "Server is healthy!!!"}