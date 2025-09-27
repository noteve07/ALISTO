# app/api/v1/routers/earthquakes.py
from fastapi import APIRouter, Query
from datetime import datetime

from app.services.earthquake_scraper import scraper_service
from app.core.config import settings

router = APIRouter()

@router.get("/live")
async def get_live_earthquakes(last: int = Query(10)):
    """
    Get the latest earthquake data from DOST-PHIVOLCS
    
    - **last**: Number of recent earthquakes to return
    """
    earthquakes = await scraper_service.scrape_latest_earthquakes(last)

    return {
        "success": True,
        "count": len(earthquakes),
        "last": last,
        "data": earthquakes,
        "source": "DOST-PHIVOLCS",
        "scraped_at": datetime.now().isoformat(),
    }

@router.get("/test")
async def test_earthquake_scraping():
    """
    Test endpoint to verify if scraping is working
    Returns a lightweight response for health checking
    """
    try:
        earthquakes = await scraper_service.scrape_latest_earthquakes(3)
        
        return {
            "status": "success",
            "message": "Scraping test successful",
            "sample_count": len(earthquakes),
            "sample_data": earthquakes[0] if earthquakes else None,
            "source": "DOST-PHIVOLCS"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }