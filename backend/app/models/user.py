from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class UserProfileUpdate(BaseModel):
    """Model for updating user profile information."""
    
    firstName: str = Field(..., min_length=1, max_length=100, description="User's first name")
    lastName: str = Field(..., min_length=1, max_length=100, description="User's last name")


class UserLocationUpdate(BaseModel):
    """Model for updating user location information."""
    
    user_lat: float = Field(..., ge=-90, le=90, description="User's latitude")
    user_lon: float = Field(..., ge=-180, le=180, description="User's longitude")
    location_enabled: bool = Field(True, description="Whether location services are enabled")


class UserProfileResponse(BaseModel):
    """Model for user profile response."""
    
    id: UUID = Field(..., description="User's unique identifier")
    firstName: str = Field(..., description="User's first name")
    lastName: str = Field(..., description="User's last name")
    email: str = Field(..., description="User's email address")
    role: Optional[str] = Field(None, description="User's role")
    user_lat: Optional[float] = Field(None, description="User's latitude")
    user_lon: Optional[float] = Field(None, description="User's longitude")
    location_enabled: Optional[bool] = Field(None, description="Location services enabled")
    home_municipality_id: Optional[int] = Field(None, description="User's home municipality ID")
    home_province_id: Optional[int] = Field(None, description="User's home province ID")
    created_at: Optional[str] = Field(None, description="Account creation timestamp")


class LocationInfo(BaseModel):
    """Model for location information response."""
    
    municipality_id: Optional[int] = Field(None, description="Municipality ID")
    municipality_name: Optional[str] = Field(None, description="Municipality name")
    province_id: Optional[int] = Field(None, description="Province ID")
    province_name: Optional[str] = Field(None, description="Province name")
    latitude: float = Field(..., description="Latitude")
    longitude: float = Field(..., description="Longitude")
