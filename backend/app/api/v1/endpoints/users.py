# app/api/v1/endpoints/users.py
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from supabase import create_client

from app.core.config import settings
from app.models.user import UserProfileUpdate, UserProfileResponse


router = APIRouter(prefix="/users", tags=["Users"])


def get_authenticated_supabase_client(authorization: Optional[str] = Header(None)):
    """Get Supabase client with user authentication."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.split(" ")[1]
        
        # Create Supabase client with user token
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Set the session token for this client
        supabase_client.auth.set_session(token, token)  # access_token, refresh_token
        
        # Get user info to verify token is valid
        user_response = supabase_client.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token: no user found")
            
        return supabase_client, user_response.user.id
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user profile with first name and last name."""
    
    # Get authenticated Supabase client and user_id
    supabase_client, user_id = get_authenticated_supabase_client(authorization)
    
    try:
        # First, check if user exists in users table, if not, create the record
        existing_user = supabase_client.table("users").select("*").eq("id", user_id).execute()
        
        if not existing_user.data:
            # Create new user record
            auth_user = supabase_client.auth.get_user()
            if not auth_user.user:
                raise HTTPException(status_code=401, detail="Could not get user from auth")
                
            # Insert new user record
            response = supabase_client.table("users").insert({
                "id": user_id,
                "firstname": profile_data.firstName,
                "lastname": profile_data.lastName,
                "email": auth_user.user.email,
                "role": "user",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }).execute()
        else:
            # Update existing user record
            response = supabase_client.table("users").update({
                "firstname": profile_data.firstName,
                "lastname": profile_data.lastName,
                "updated_at": datetime.now().isoformat()
            }).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save user profile")
        
        updated_user = response.data[0]
        
        return UserProfileResponse(
            id=updated_user["id"],
            firstName=updated_user["firstname"],
            lastName=updated_user["lastname"],
            email=updated_user["email"],
            role=updated_user.get("role"),
            created_at=updated_user.get("created_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    authorization: Optional[str] = Header(None)
):
    """Get current user profile."""
    
    # Get authenticated Supabase client and user_id
    supabase_client, user_id = get_authenticated_supabase_client(authorization)
    
    try:
        # Get user profile from Supabase
        response = supabase_client.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response.data[0]
        
        return UserProfileResponse(
            id=user["id"],
            firstName=user.get("firstname", ""),
            lastName=user.get("lastname", ""),
            email=user["email"],
            role=user.get("role"),
            created_at=user.get("created_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")
