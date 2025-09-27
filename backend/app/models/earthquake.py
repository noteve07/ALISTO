# app/models/earthquake.py
from pydantic import BaseModel
from typing import List

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