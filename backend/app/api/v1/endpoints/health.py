# app/api/v1/routers/health.py
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.services.live.earthquakes.earthquake_scraper import earthquake_scraper


router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
async def health_check():
    """Basic health check endpoint."""

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": settings.PROJECT_DESCRIPTION,
        "checked_at": datetime.now().isoformat(),
    }


@router.get("/scraper")
async def scraper_health_check(
    limit: int = Query(
        default=5,
        ge=1,
        le=settings.max_earthquake_limit,
        description="Number of recent earthquakes to scrape for diagnostics",
    )
):
    """Diagnostic endpoint to verify the earthquake scraper is working."""

    try:
        earthquakes = await earthquake_scraper.scrape_latest_earthquakes(limit)
        return {
            "success": True,
            "count": len(earthquakes),
            "limit": limit,
            "data": [eq.dict() for eq in earthquakes],
            "source": "scraper",
            "checked_at": datetime.now().isoformat(),
        }
    except HTTPException as exc:  # propagate known errors
        raise exc
    except Exception as exc:  # wrap unexpected errors
        raise HTTPException(status_code=500, detail=str(exc)) from exc