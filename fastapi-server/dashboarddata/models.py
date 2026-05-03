"""
dashboarddata/models.py
Pydantic response models for the dashboard API.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


# ─────────────────────────────────────────────
# Stat Cards
# ─────────────────────────────────────────────

class StatCardData(BaseModel):
    total_scientists: int          # profiles with profession = researcher/scientist
    total_engineers: int           # profiles with profession = engineer
    active_edges: int              # papers count (proxy for active connections)
    avg_knowledge_lag: float       # avg (current_year - paper year), rounded
    bottlenecks_detected: int      # papers with probability < 0.4 (low confidence)
    resolved_transfers: int        # papers with confidence = 'high'


# ─────────────────────────────────────────────
# SIPOC
# ─────────────────────────────────────────────

class SIPOCData(BaseModel):
    transfer_success_rate: float   # % papers with confidence != 'low'
    engineer_readiness: float      # % engineers out of total profiles


# ─────────────────────────────────────────────
# Activity Feed
# ─────────────────────────────────────────────

class ActivityItem(BaseModel):
    type: str           # "paper_assigned" | "bottleneck" | "handoff" | "node"
    title: str
    subtitle: str
    time: str           # relative time string, e.g. "4m ago"


class ActivityFeedData(BaseModel):
    items: list[ActivityItem]


# ─────────────────────────────────────────────
# Charts
# ─────────────────────────────────────────────

class LagBarData(BaseModel):
    label: str    # e.g. "OCT 23"
    value: float  # normalized 0-1


class LagTrendData(BaseModel):
    bars: list[LagBarData]
    x_labels: list[str]


class DonutSegment(BaseModel):
    label: str
    value: float   # percentage 0-100


class ResourceDistributionData(BaseModel):
    segments: list[DonutSegment]
    center_pct: int   # dominant segment percentage


# ─────────────────────────────────────────────
# Combined Dashboard Response
# ─────────────────────────────────────────────

class DashboardResponse(BaseModel):
    stats: StatCardData
    sipoc: SIPOCData
    activity: ActivityFeedData
    lag_trend: LagTrendData
    resource_distribution: ResourceDistributionData