# app/api/v1/endpoints/users.py
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from supabase import create_client
from uuid import UUID

from app.core.config import settings
from app.models.user import UserProfileUpdate, UserProfileResponse, UserLocationUpdate, UserLocationResponse
from app.utils.location import get_location_from_coords


router = APIRouter(prefix="/users", tags=["Users"])


def get_authenticated_supabase_client(authorization: Optional[str] = Header(None)):
    """Get Supabase client and authenticated user info."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.split(" ")[1]
        
        # Create Supabase client (service role)
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        user_response = supabase_client.auth.get_user(token)

        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token: no user found")
            
        return supabase_client, user_response.user.id, user_response.user, token
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user profile with first name and last name."""
    
    # Get authenticated Supabase client and user_id
    supabase_client, user_id, auth_user, _ = get_authenticated_supabase_client(authorization)
    
    try:
        # First, check if user exists in users table, if not, create the record
        existing_user = supabase_client.table("users").select("*").eq("id", user_id).execute()
        
        if not existing_user.data:
            # Create new user record
            # Insert new user record
            response = supabase_client.table("users").insert({
                "id": user_id,
                "firstname": profile_data.firstName,
                "lastname": profile_data.lastName,
                "email": auth_user.email,
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
            user_lat=updated_user.get("user_lat"),
            user_lon=updated_user.get("user_lon"),
            location_enabled=updated_user.get("location_enabled"),
            home_municipality_id=updated_user.get("home_municipality_id"),
            home_province_id=updated_user.get("home_province_id"),
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
    supabase_client, user_id, _, _ = get_authenticated_supabase_client(authorization)
    
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
            user_lat=user.get("user_lat"),
            user_lon=user.get("user_lon"),
            location_enabled=user.get("location_enabled"),
            home_municipality_id=user.get("home_municipality_id"),
            home_province_id=user.get("home_province_id"),
            created_at=user.get("created_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")


@router.get("/location", response_model=UserLocationResponse)
async def get_user_location(
    user_id: UUID = Query(default="7d5a67ce-e1cb-43b7-8fc2-df741ce4e94a", description="User ID")
):
    """Get user location with fallback to Balanga City, Bataan."""
    
    # Balanga City fallback coordinates
    BALANGA_LAT = 14.676041
    BALANGA_LON = 120.536319
    
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    try:
        # Get user data
        response = supabase_client.table("users").select(
            "user_lat, user_lon, home_municipality_id, home_province_id"
        ).eq("id", str(user_id)).execute()
        
        if not response.data:
            print(f"⚠️ User {user_id} not found - using Balanga City fallback")
            return UserLocationResponse(
                lat=BALANGA_LAT,
                lon=BALANGA_LON,
                municipality="Balanga City",
                province="Bataan",
                is_fallback=True
            )
        
        user = response.data[0]
        lat = user.get("user_lat")
        lon = user.get("user_lon")
        municipality_id = user.get("home_municipality_id")
        province_id = user.get("home_province_id")
        
        # Check if user has location data
        if not lat or not lon:
            print(f"⚠️ User {user_id} has no location data - using Balanga City fallback")
            return UserLocationResponse(
                lat=BALANGA_LAT,
                lon=BALANGA_LON,
                municipality="Balanga City",
                province="Bataan",
                is_fallback=True
            )
        
        # Get municipality name
        municipality_name = "Unknown"
        if municipality_id:
            mun_response = supabase_client.table("municities").select("name").eq("municity_id", municipality_id).execute()
            if mun_response.data:
                municipality_name = mun_response.data[0]["name"]
        
        # Get province name
        province_name = "Unknown"
        if province_id:
            prov_response = supabase_client.table("provinces").select("name").eq("province_id", province_id).execute()
            if prov_response.data:
                province_name = prov_response.data[0]["name"]
        
        return UserLocationResponse(
            lat=lat,
            lon=lon,
            municipality=municipality_name,
            province=province_name,
            is_fallback=False
        )
        
    except Exception as e:
        print(f"⚠️ Error fetching location for user {user_id}: {str(e)} - using Balanga City fallback")
        return UserLocationResponse(
            lat=BALANGA_LAT,
            lon=BALANGA_LON,
            municipality="Balanga City",
            province="Bataan",
            is_fallback=True
        )


@router.post("/location", response_model=UserProfileResponse)
async def update_user_location(
    location_data: UserLocationUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user location and automatically determine municipality/province."""
    
    # Get authenticated Supabase client and user_id
    supabase_client, user_id, _, _ = get_authenticated_supabase_client(authorization)
    
    try:
        # Get location information (municipality/province) from coordinates using SQL function
        location_info = get_location_from_coords(
            supabase_client,
            location_data.user_lat, 
            location_data.user_lon
        )
        
        # Update user record with location data
        update_data = {
            "user_lat": location_data.user_lat,
            "user_lon": location_data.user_lon,
            "location_enabled": location_data.location_enabled,
            "updated_at": datetime.now().isoformat()
        }
        
        # Add municipality and province if found
        if location_info.get("municipality_id"):
            update_data["home_municipality_id"] = location_info["municipality_id"]
        if location_info.get("province_id"):
            update_data["home_province_id"] = location_info["province_id"]
        
        response = supabase_client.table("users").update(update_data).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update user location")
        
        updated_user = response.data[0]
        
        return UserProfileResponse(
            id=updated_user["id"],
            firstName=updated_user.get("firstname", ""),
            lastName=updated_user.get("lastname", ""),
            email=updated_user["email"],
            role=updated_user.get("role"),
            user_lat=updated_user.get("user_lat"),
            user_lon=updated_user.get("user_lon"),
            location_enabled=updated_user.get("location_enabled"),
            home_municipality_id=updated_user.get("home_municipality_id"),
            home_province_id=updated_user.get("home_province_id"),
            created_at=updated_user.get("created_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user location: {str(e)}")

