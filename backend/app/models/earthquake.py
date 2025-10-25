# app/models/earthquake.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class EarthquakeRawData(BaseModel):
    """Raw data exactly as scraped from PHIVOLCS"""
    datetime: str
    latitude: float
    longitude: float
    depth: int
    magnitude: float
    location: str


class EarthquakeData(BaseModel):
    """Processed data ready for database"""
    eq_id: str
    datetime: datetime
    latitude: float
    longitude: float
    depth: int
    magnitude: float
    location: str
    province_id: Optional[int] = None
    coordinates: Optional[str] = None


class EarthquakeResponse(BaseModel):
    success: bool
    count: int
    data: List[EarthquakeData]
    source: str
    scraped_at: str