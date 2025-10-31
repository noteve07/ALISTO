"""Pydantic models for chatbot endpoints"""
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None  

class ChatResponse(BaseModel):
    response: str
    success: bool

class EarthquakeData(BaseModel):
    datetime: str
    magnitude: float
    depth: float
    province: str
    location: str

class EarthquakesSummary(BaseModel):
    count: int
    average_magnitude: float
    highest_magnitude: float
    data: list[EarthquakeData]

class LatestEarthquakesResponse(BaseModel):
    success: bool
    earthquakes_last_24_hours: EarthquakesSummary
    error: str | None = None
