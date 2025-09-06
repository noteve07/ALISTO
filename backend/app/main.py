from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import urllib3

# disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# create FastAPI app
app = FastAPI(
    title="ALISTO API",
    description="Automated Live Information for Seismic Tracking and Observation",
    version="1.0.0"
)

# add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# pydantic models for earthquake data
class EarthquakeData(BaseModel):
    date_time: str
    latitude: float
    longitude: float
    depth: int
    magnitude: float
    location: str

class EarthquakeResponse(BaseModel):
    success: bool
    count: int
    data: List[EarthquakeData]
    source: str
    scraped_at: str


# service function to scrape live earthquake data
async def scrape_latest_earthquake(limit: int = 10) -> List[EarthquakeData]:
    """Scrape latest earthquakes from DOST-PHIVOLCS website (10 for now)"""
    
    url = "https://earthquake.phivolcs.dost.gov.ph/"

    try: 
        # get the webpage
        response = requests.get(url, verify=False, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to fetch data from PHIVOLSC. Status: {response.status_code}")
        
        # parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        rows = soup.select('table tr')
        data_rows = [r for r in rows if len(r.find_all("td")) == 6]

        if not data_rows:
            raise HTTPException(status_code=500, detail="No earthquake data found")
        
        # convert data rows to earthquake data
        earthquakes = []
        for row in data_rows[:limit]:
            cells = [td.get_text(strip=True) for td in row.find_all("td")]

            try:
                earthquake = EarthquakeData(
                    date_time=cells[0],
                    latitude=float(cells[1]),
                    longitude=float(cells[2]),
                    depth=int(cells[3]),
                    magnitude=float(cells[4]),
                    location=cells[5],
                )
                earthquakes.append(earthquake)
            except (ValueError, IndexError) as e:
                # skip invalid data
                continue
        
        return earthquakes

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected Scraping error: {str(e)}")


# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "ALISTO API is running!",
        "description": "Automated Live Information for Seismic Tracking and Observation",
        "endpoints": {
            "latest_earthquakes": "/api/v1/earthquakes/latest",
            "health": "/health",
            "docs": "/docs",
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ALISTO API"}

@app.get("/api/v1/earthquakes/latest", response_model=EarthquakeResponse)
async def get_latest_earthquakes(limit: int = 10):
    """
    Get the latest earthquake data from DOST-PHIVOLCS
    """
    
    earthquakes = await scrape_latest_earthquake(limit)

    return EarthquakeResponse(
        success=True,
        count=len(earthquakes),
        data=earthquakes,
        source="DOST-PHIVOLCS",
        scraped_at=datetime.now().isoformat(),
    )

@app.get("/api/v1/earthquakes/test")
async def test_all_earthquakes():
    """
    Test endpoint to verify if scraping is working
    """
    try: 
        earthquakes = await scrape_latest_earthquake(3)
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