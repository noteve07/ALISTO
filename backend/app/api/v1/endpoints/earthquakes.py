# app/api/v1/routers/earthquakes.py
from datetime import datetime, timedelta

from fastapi import APIRouter, Query

from app.core.config import settings
from app.core.database import supabase


router = APIRouter(prefix="/earthquakes", tags=["Earthquakes"])


@router.get("/latest")
async def get_latest_earthquakes(
    count: int = Query(
        default=settings.max_earthquake_limit,
        ge=1,
        le=settings.max_earthquake_limit,
        description="Maximum number of recent earthquakes to return",
    ),
    hours: int = Query(
        default=24,
        ge=1,
        description="Number of hours to look back from now",
    ),
):
    """Retrieve the latest earthquakes optionally filtered by a recent time window."""

    try:
        now = datetime.now()
        start_time = now - timedelta(hours=hours)
        start_iso = start_time.isoformat()

        query = (
            supabase.table("latest_earthquakes")
            .select("*")
            .gte("datetime", start_iso)
            .order("datetime", desc=True)
            .limit(count)
        )

        result = query.execute()
        earthquakes = result.data if result.data else []

        return {
            "success": True,
            "count": len(earthquakes),
            "limit": count,
            "hours": hours,
            "data": earthquakes,
            "window_start": start_iso,
            "window_end": now.isoformat(),
            "source": "database",
            "fetched_at": now.isoformat(),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": [],
        }