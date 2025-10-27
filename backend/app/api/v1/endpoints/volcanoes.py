"""Volcano advisory endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.database import supabase


router = APIRouter(prefix="/volcanoes", tags=["Volcanoes"])


@router.get("/advisories")
async def get_volcano_advisories(
    include_zero_alerts: bool = Query(
        default=False, description="Include advisories with alert level 0"
    ),
):
    """Return volcano advisories with optional alert level filtering."""

    try:
        result = (
            supabase.table("volcanic_advisories")
            .select("*")
            .order("alert_level", desc=True)
            .execute()
        )

        advisories = result.data if result.data else []

        if not include_zero_alerts:
            advisories = [item for item in advisories if item.get("alert_level", 0) > 0]

        return {
            "success": True,
            "count": len(advisories),
            "data": advisories,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "success": False,
            "error": str(exc),
            "data": [],
        }

