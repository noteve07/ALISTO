from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class UserProfileUpdate(BaseModel):
    """Model for updating user profile information."""
    
    firstName: str = Field(..., min_length=1, max_length=100, description="User's first name")
    lastName: str = Field(..., min_length=1, max_length=100, description="User's last name")


class UserProfileResponse(BaseModel):
    """Model for user profile response."""
    
    id: UUID = Field(..., description="User's unique identifier")
    firstName: str = Field(..., description="User's first name")
    lastName: str = Field(..., description="User's last name")
    email: str = Field(..., description="User's email address")
    role: Optional[str] = Field(None, description="User's role")
    created_at: Optional[str] = Field(None, description="Account creation timestamp")
