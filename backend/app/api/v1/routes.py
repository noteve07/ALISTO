from datetime import datetime

from fastapi import APIRouter

from app.core.config import settings

from .endpoints import earthquakes
from .endpoints import health
from .endpoints import volcanoes
from .endpoints import dashboard
from .endpoints import risk_evaluations
from .endpoints import users


api_router = APIRouter()


@api_router.get("/")
async def api_v1_root():
    """Root landing endpoint for API v1."""

    now = datetime.now().isoformat()

    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": settings.PROJECT_DESCRIPTION,
        "documentation": "/docs",
        "endpoints": {
            "earthquakes_latest": "/api/v1/earthquakes/latest",
            "health": "/api/v1/health",
            "health_scraper": "/api/v1/health/scraper",
            "volcanic_advisories": "/api/v1/volcanoes/advisories",
            "dashboard": "/api/v1/dashboard",
            "users_profile": "/api/v1/users/profile",
        },
        "timestamp": now,
    }


api_router.include_router(dashboard.router)
api_router.include_router(health.router)
api_router.include_router(earthquakes.router)
api_router.include_router(volcanoes.router)
api_router.include_router(risk_evaluations.router)
api_router.include_router(users.router)