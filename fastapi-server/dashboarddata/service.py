"""
dashboarddata/service.py
Queries `profiles` and `papers` tables to build dashboard metrics.
Uses the same admin client pattern as auth/service.py.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from dotenv import load_dotenv

from .models import (
    ActivityFeedData,
    ActivityItem,
    DashboardResponse,
    DonutSegment,
    LagBarData,
    LagTrendData,
    ResourceDistributionData,
    SIPOCData,
    StatCardData,
)
from config.postgres_db import SessionLocal
from auth.models import User
from Roadmap.models import Paper

load_dotenv()

# Professions that map to "scientist/researcher" vs "engineer"
_SCIENTIST_PROFESSIONS = {"researcher", "scientist", "academic", "phd", "postdoc"}
_ENGINEER_PROFESSIONS  = {"engineer", "developer", "architect", "swe", "devops"}

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _relative_time(ts_str: str) -> str:
    """Convert ISO timestamp string to a relative time label."""
    try:
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        diff = datetime.now(timezone.utc) - ts
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return f"{seconds}s ago"
        if seconds < 3600:
            return f"{seconds // 60}m ago"
        if seconds < 86400:
            return f"{seconds // 3600}h ago"
        return f"{seconds // 86400}d ago"
    except Exception:
        return "recently"


def _normalize_bars(values: list[float]) -> list[float]:
    """Normalize a list to 0–1 relative to max."""
    mx = max(values) if values else 1
    return [v / mx for v in values] if mx else [0] * len(values)


# ─────────────────────────────────────────────
# DashboardService
# ─────────────────────────────────────────────

class DashboardService:

    # ── Stats ────────────────────────────────

    async def get_stats(self) -> StatCardData:

        db = SessionLocal()

        try:

            profiles = db.query(User).all()

            scientists = sum(
                1 for p in profiles
                if str(p.profession).lower() in _SCIENTIST_PROFESSIONS
            )

            engineers = sum(
                1 for p in profiles
                if str(p.profession).lower() in _ENGINEER_PROFESSIONS
            )

            papers = db.query(Paper).all()

            current_year = datetime.now().year

            active_edges = len(papers)

            years = [
                p.year
                for p in papers
                if p.year
            ]

            avg_lag = (
                round(
                    sum(current_year - y for y in years)
                    / len(years),
                    1
                )
                if years else 0
            )

            bottlenecks = sum(
                1
                for p in papers
                if p.probability and p.probability < 0.4
            )

            resolved = sum(
                1
                for p in papers
                if str(p.confidence).lower() == "high"
            )

            return StatCardData(
                total_scientists=scientists,
                total_engineers=engineers,
                active_edges=active_edges,
                avg_knowledge_lag=avg_lag,
                bottlenecks_detected=bottlenecks,
                resolved_transfers=resolved,
            )

        finally:
            db.close()

    # ── SIPOC ─────────────────────────────────

    async def get_sipoc(self) -> SIPOCData:

        db = SessionLocal()

        try:

            profiles = db.query(User).all()

            total = len(profiles) or 1

            engineers = sum(
                1
                for p in profiles
                if str(p.profession).lower() in _ENGINEER_PROFESSIONS
            )

            papers = db.query(Paper).all()

            total_papers = len(papers) or 1

            successes = sum(
                1
                for p in papers
                if str(p.confidence).lower() != "low"
            )

            transfer_rate = round(
                (successes / total_papers) * 100,
                1
            )

            engineer_readiness = round(
                (engineers / total) * 100,
                1
            )

            return SIPOCData(
                transfer_success_rate=transfer_rate,
                engineer_readiness=engineer_readiness,
            )

        finally:
            db.close()

    # ── Activity Feed ─────────────────────────

    async def get_activity(self, limit: int = 10) -> ActivityFeedData:
        """Return the most recently created/updated papers as activity items."""
        db = SessionLocal()
        papers = (
            db.query(Paper)
            .order_by(Paper.id.desc())
            .limit(limit)
            .all()
        )

        items: list[ActivityItem] = []
        for p in papers:
            conf = str(p.confidence or "").lower()
            prob = p.probability or 1.0
            title = p.title or "Untitled Paper"
            created = p.get("created_at", "")
            time_str = _relative_time(created)

            if prob < 0.4:
                items.append(ActivityItem(
                    type="bottleneck",
                    title="Bottleneck Detected",
                    subtitle=f"{title} — low confidence score",
                    time=time_str,
                ))
            elif conf == "high":
                items.append(ActivityItem(
                    type="handoff",
                    title="Successful Handoff",
                    subtitle=title,
                    time=time_str,
                ))
            elif conf == "medium":
                items.append(ActivityItem(
                    type="paper_assigned",
                    title=title,
                    subtitle="Assigned for review",
                    time=time_str,
                ))
            else:
                items.append(ActivityItem(
                    type="node",
                    title="New Node Created",
                    subtitle=title,
                    time=time_str,
                ))

        return ActivityFeedData(items=items)

    # ── Lag Trend ─────────────────────────────

    async def get_lag_trend(self) -> LagTrendData:
        """Group papers by year, compute avg lag per year, return last 8 buckets."""
        db = SessionLocal()
        papers = db.query(Paper).all()
        current_year = datetime.now().year

        # Group lags by year
        from collections import defaultdict
        year_lags: dict[int, list[int]] = defaultdict(list)
        for p in papers:
            y = p.year
            if y:
                year_lags[int(y)].append(current_year - int(y))

        sorted_years = sorted(year_lags.keys())[-8:]  # last 8 distinct years
        avg_lags = [
            sum(year_lags[y]) / len(year_lags[y]) for y in sorted_years
        ]
        normalized = _normalize_bars(avg_lags)

        bars = [
            LagBarData(label=str(y), value=n)
            for y, n in zip(sorted_years, normalized)
        ]

        # X-axis labels: first and last shown as quarters if possible
        x_labels = [str(y) for y in sorted_years[::max(1, len(sorted_years) // 4)]]

        return LagTrendData(bars=bars, x_labels=x_labels)

    # ── Resource Distribution ─────────────────

    async def get_resource_distribution(self) -> ResourceDistributionData:
        db = SessionLocal()
        profiles = db.query(User).all()
        total = len(profiles) or 1

        scientists = sum(
            1
            for p in profiles
            if str(p.profession or "").lower() in _SCIENTIST_PROFESSIONS
        )

        engineers = sum(
            1
            for p in profiles
            if str(p.profession or "").lower() in _ENGINEER_PROFESSIONS
        )
        idle = total - scientists - engineers

        segments = [
            DonutSegment(label="Research Clusters", value=round(scientists / total * 100, 1)),
            DonutSegment(label="Dev Integrations",  value=round(engineers / total * 100, 1)),
            DonutSegment(label="Idle Capacity",     value=round(max(idle, 0) / total * 100, 1)),
        ]

        dominant = max(segments, key=lambda s: s.value)

        return ResourceDistributionData(
            segments=segments,
            center_pct=int(dominant.value),
        )

    # ── Combined ──────────────────────────────

    async def get_dashboard(self) -> DashboardResponse:
        stats        = await self.get_stats()
        sipoc        = await self.get_sipoc()
        activity     = await self.get_activity()
        lag_trend    = await self.get_lag_trend()
        resource     = await self.get_resource_distribution()

        return DashboardResponse(
            stats=stats,
            sipoc=sipoc,
            activity=activity,
            lag_trend=lag_trend,
            resource_distribution=resource,
        )


dashboard_service = DashboardService()