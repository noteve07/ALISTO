# app/services/scraper.py
from app.models.earthquake import EarthquakeRawData
from app.core.config import settings

from typing import List
from fastapi import HTTPException
from datetime import datetime

import requests
import urllib3
from bs4 import BeautifulSoup

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class EarthquakeScraperService:
    """Scrape recent earthquake data from PHIVOLCS."""
    
    def __init__(self):
        self.base_url = settings.phivolcs_url
        self.timeout = settings.request_timeout
    
    async def scrape_latest_earthquakes(self, limit: int | None = None) -> List[EarthquakeRawData]:
        """Scrape latest earthquakes from DOST-PHIVOLCS website"""
        
        try:
            print(f"🌐 Scraping earthquakes at {datetime.now()}")

            # Fetch webpage - scraping starts here
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

            # if limit is None, get all rows
            target_rows = data_rows if limit is None else data_rows[:limit]

            # convert to EarthquakeRawData objects
            earthquakes = []
            for row in target_rows:
                cells = [td.get_text(strip=True) for td in row.find_all("td")]
          
                try:
                    earthquake = EarthquakeRawData(
                        datetime=cells[0],
                        latitude=float(cells[1]),
                        longitude=float(cells[2]),
                        depth=int(float(cells[3])),
                        magnitude=float(cells[4]),
                        location=cells[5],
                    )
                    earthquakes.append(earthquake)
                except (ValueError, IndexError):
                    continue  # skip invalid data
                
            print(f"✅ Scraped {len(earthquakes)} raw earthquake data")
            return earthquakes

        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

# Singleton instance
earthquake_scraper = EarthquakeScraperService()