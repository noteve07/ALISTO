# app/models/province.py
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ProvinceBase(BaseModel):
    """Base province model with common fields"""
    name: str = Field(..., max_length=100, description="Province name")

class ProvinceCreate(ProvinceBase):
    """Model for creating a new province"""
    boundaries: Optional[str] = Field(None, description="GeoJSON polygon string for province boundaries")
    centroid: Optional[str] = Field(None, description="GeoJSON point string for province centroid")

class ProvinceUpdate(BaseModel):
    """Model for updating province data"""
    name: Optional[str] = Field(None, max_length=100)
    boundaries: Optional[str] = None
    centroid: Optional[str] = None

class ProvinceInDB(ProvinceBase):
    """Province model as stored in database"""
    province_id: int
    boundaries: Optional[str] = None
    centroid: Optional[str] = None
    created_at: Optional[datetime] = None

class Province(ProvinceInDB):
    """Complete province model for API responses"""
    pass

class ProvinceSimple(BaseModel):
    """Simplified province model for dropdowns/references"""
    province_id: int
    name: str

class ProvinceWithStats(Province):
    """Province model with additional statistics"""
    total_earthquakes: Optional[int] = Field(default=0, description="Total earthquakes recorded")
    latest_earthquake: Optional[datetime] = Field(None, description="Latest earthquake timestamp")
    avg_magnitude: Optional[float] = Field(None, description="Average earthquake magnitude")
    max_magnitude: Optional[float] = Field(None, description="Maximum earthquake magnitude")