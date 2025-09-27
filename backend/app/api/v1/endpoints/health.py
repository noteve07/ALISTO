# app/api/v1/routers/health.py
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy", 
        "service": settings.app_name,
        "version": settings.version
    }

@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"🌍 {settings.app_name} is running!",
        "description": settings.app_description,
        "version": settings.version,
        "endpoints": {
            "live_earthquakes": "/api/v1/earthquakes/live",
            "test_scraping": "/api/v1/earthquakes/test",
            "health": "/health",
            "docs": "/docs"
        }
    }