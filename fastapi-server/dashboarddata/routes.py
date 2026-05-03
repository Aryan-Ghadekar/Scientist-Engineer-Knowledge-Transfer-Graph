"""
dashboarddata/routes.py
FastAPI router for dashboard data endpoints.
Mount in main.py:  app.include_router(dashboard_router)
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from .models import (
    ActivityFeedData,
    DashboardResponse,
    LagTrendData,
    ResourceDistributionData,
    SIPOCData,
    StatCardData,
)
from .service import dashboard_service

router = APIRouter(prefix="/dashstats", tags=["DashStats"])

# ─────────────────────────────────────────────
# Combined endpoint (most efficient — one round trip)
# ─────────────────────────────────────────────

@router.get(
    "/",
    response_model=DashboardResponse,
    summary="Get all dashboard data in one call",
)
async def get_dashboard() -> DashboardResponse:
    try:
        return await dashboard_service.get_dashboard()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard fetch failed: {type(exc).__name__}: {exc}",
        )


# ─────────────────────────────────────────────
# Individual endpoints (for partial refreshes)
# ─────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=StatCardData,
    summary="Get stat card metrics",
)
async def get_stats() -> StatCardData:
    try:
        return await dashboard_service.get_stats()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stats fetch failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/sipoc",
    response_model=SIPOCData,
    summary="Get SIPOC analysis metrics",
)
async def get_sipoc() -> SIPOCData:
    try:
        return await dashboard_service.get_sipoc()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SIPOC fetch failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/activity",
    response_model=ActivityFeedData,
    summary="Get recent activity feed (latest papers as events)",
)
async def get_activity(limit: int = 10) -> ActivityFeedData:
    try:
        return await dashboard_service.get_activity(limit=limit)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Activity fetch failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/lag-trend",
    response_model=LagTrendData,
    summary="Get knowledge lag trend data for bar chart",
)
async def get_lag_trend() -> LagTrendData:
    try:
        return await dashboard_service.get_lag_trend()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lag trend fetch failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/resource-distribution",
    response_model=ResourceDistributionData,
    summary="Get resource distribution for donut chart",
)
async def get_resource_distribution() -> ResourceDistributionData:
    try:
        return await dashboard_service.get_resource_distribution()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resource distribution fetch failed: {type(exc).__name__}: {exc}",
        )