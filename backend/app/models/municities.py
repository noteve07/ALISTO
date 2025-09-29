from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class MunicipalityCityBase(BaseModel):
    """Base model for Municipality/City."""
    municity_id: int  # Added municity_id field to match database schema
    name: str
    province_id: int
    boundaries: Optional[Dict[str, Any]] = None
    centroid: Optional[Dict[str, Any]] = None

class MunicipalityCityCreate(MunicipalityCityBase):
    """Create model for Municipality/City."""
    pass

class MunicipalityCityUpdate(BaseModel):
    """Update model for Municipality/City."""
    name: Optional[str] = None
    province_id: Optional[int] = None
    boundaries: Optional[Dict[str, Any]] = None
    centroid: Optional[Dict[str, Any]] = None

class MunicipalityCityInDB(MunicipalityCityBase):
    """Database model for Municipality/City."""
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MunicipalityCityRead(MunicipalityCityInDB):
    """Read model for Municipality/City."""
    pass

class MunicipalityCitySimple(BaseModel):
    """Simplified model for Municipality/City."""
    municity_id: int
    name: str
    province_id: int

    class Config:
        orm_mode = True