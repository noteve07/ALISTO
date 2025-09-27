# app/services/scraper.py
import requests
from bs4 import BeautifulSoup
from typing import List
from fastapi import HTTPException
import urllib3

from app.models.earthquake import EarthquakeData
from app.core.config import settings

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class EarthquakeScrapingService:
    """Service for scraping earthquake data from PHIVOLCS"""
    
    def __init__(self):
        self.base_url = settings.phivolcs_url
        self.timeout = settings.request_timeout
    
    async def scrape_latest_earthquakes(self, limit: int = 10) -> List[EarthquakeData]:
        """Scrape latest earthquakes from DOST-PHIVOLCS website"""
        
        try:
            # Fetch webpage
            response = requests.get(self.base_url, verify=False, timeout=self.timeout)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to fetch data from PHIVOLCS. Status: {response.status_code}"
                )
            
            # Parse HTML content
            soup = BeautifulSoup(response.content, 'html.parser')
            rows = soup.select('table tr')
            data_rows = [r for r in rows if len(r.find_all("td")) == 6]

            if not data_rows:
                raise HTTPException(status_code=404, detail="No earthquake data found")
            
            # Convert to EarthquakeData objects
            earthquakes = []
            for row in data_rows[:limit]:
                cells = [td.get_text(strip=True) for td in row.find_all("td")]
                
                try:
                    earthquake = EarthquakeData(
                        date_time=cells[0],
                        latitude=float(cells[1]),
                        longitude=float(cells[2]),
                        depth=int(float(cells[3])),
                        magnitude=float(cells[4]),
                        location=cells[5],
                    )
                    earthquakes.append(earthquake)
                except (ValueError, IndexError):
                    # Skip invalid data
                    continue
            
            return earthquakes

        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

# Singleton instance
scraper_service = EarthquakeScrapingService()