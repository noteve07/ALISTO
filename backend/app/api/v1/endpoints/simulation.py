"""Simulation endpoints for testing earthquake and volcanic advisory data."""

from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.core.database import supabase
from app.services.live.earthquakes.earthquake_updater import earthquake_updater
from app.services.notifications.notification_service import notification_service


router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/simulate-earthquake")
async def simulate_earthquake(
    option: int = Query(
        default=1,
        ge=1,
        le=3,
        description="Select which test earthquake to simulate (1, 2, or 3)"
    )
):
    """
    Simulate an earthquake insertion for testing purposes.
    
    Options:
    - 1: Northern Samar (Mag 4.6, Shallow)
    - 2: Bataan - Mariveles (Mag 3.8, Deep)
    - 3: Bataan - Balanga City (Mag 5.6, Moderate depth)
    """
    
    try:
        # Get current datetime in ISO format without timezone
        now = datetime.now()
        datetime_iso = now.isoformat()
        
        # Format datetime for eq_id (MMDD_HHMM_SS)
        datetime_suffix = now.strftime("%m%d_%H%M_%S")
        
        # Define test earthquake scenarios
        test_earthquakes = {
            1: {
                "eq_id": f"eq_test_1_{datetime_suffix}",
                "datetime": datetime_iso,
                "latitude": 12.51,
                "longitude": 125.17,
                "coordinates": f"SRID=4326;POINT({125.17} {12.51})",
                "depth": 17,
                "magnitude": 4.6,
                "location": "007 km S 59° E of Palapag (Northern Samar)",
                "province_id": 54,  # Northern Samar
            },
            2: {
                "eq_id": f"eq_test_2_{datetime_suffix}",
                "datetime": datetime_iso,
                "latitude": 14.29,
                "longitude": 120.45,
                "coordinates": f"SRID=4326;POINT({120.45} {14.29})",
                "depth": 125,
                "magnitude": 2.4,
                "location": "017 km S 17° W of Mariveles (Bataan)",
                "province_id": 10,  # Bataan
            },
            3: {
                "eq_id": f"eq_test_3_{datetime_suffix}",
                "datetime": datetime_iso,
                "latitude": 14.593881,
                "longitude": 120.566876,
                "coordinates": f"SRID=4326;POINT({120.566876} {14.593881})",
                "depth": 32,
                "magnitude": 5.6,
                "location": "018 km S of 12° W of Balanga City (Bataan)",
                "province_id": 10,  # Bataan
            },
        }
        
        # Get selected earthquake
        if option not in test_earthquakes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid option. Must be 1, 2, or 3. Got: {option}"
            )
        
        earthquake_data = test_earthquakes[option]
        
        # Insert earthquake using the updater service
        success = await earthquake_updater.add_or_skip_earthquakes([earthquake_data])
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to insert test earthquake into database"
            )
        
        return {
            "success": True,
            "message": f"Successfully simulated earthquake (option {option})",
            "data": earthquake_data,
            "inserted_at": datetime_iso,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error simulating earthquake: {str(e)}"
        )


@router.get("/earthquakes-info")
async def get_test_earthquakes_info():
    """Get information about available test earthquake scenarios."""
    
    return {
        "success": True,
        "available_scenarios": {
            "1": {
                "name": "Northern Samar - Palapag",
                "magnitude": 2.9,
                "depth": 17,
                "location": "007 km S 59° E of Palapag (Northern Samar)",
                "coordinates": {"lat": 12.51, "lon": 125.17},
                "province": "Northern Samar",
                "province_id": 54,
            },
            "2": {
                "name": "Bataan - Mariveles",
                "magnitude": 2.4,
                "depth": 125,
                "location": "017 km S 17° W of Mariveles (Bataan)",
                "coordinates": {"lat": 14.29, "lon": 120.45},
                "province": "Bataan",
                "province_id": 10,
            },
            "3": {
                "name": "Bataan - Balanga City",
                "magnitude": 5.6,
                "depth": 32,
                "location": "018 km S of 12° W of Balanga City (Bataan)",
                "coordinates": {"lat": 14.593881, "lon": 120.566876},
                "province": "Bataan",
                "province_id": 10,
            },
        },
        "usage": "POST /api/v1/simulation/simulate-earthquake?option=<1|2|3>",
    }


@router.post("/simulate-volcanic-advisory")
async def simulate_volcanic_advisory(
    option: int = Query(
        default=1,
        ge=1,
        le=2,
        description="Select which volcanic advisory to simulate (1 or 2)"
    )
):
    """
    Simulate a volcanic advisory update for testing purposes.
    
    Options:
    - 1: Mt. Isarog (Alert Level 2 - Low-level Unrest)
    - 2: Mt. Pinatubo (Alert Level 3 - Increased Unrest)
    """
    
    try:
        # Get current datetime
        now = datetime.now()
        # Format for Supabase timestamp without timezone
        timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S.%f")
        
        # Define volcanic advisory scenarios
        advisory_scenarios = {
            1: {
                "volcano_id": 13,  # Mt. Isarog
                "alert_level": 2,
                "alert_status": "Low-level Unrest",
                "bulletin_link": None,
                "issuance_date": None,
                "updated_at": timestamp_str,
            },
            2: {
                "volcano_id": 21,  # Mt. Pinatubo
                "alert_level": 3,
                "alert_status": "Increased Unrest",
                "bulletin_link": None,
                "issuance_date": None,
                "updated_at": timestamp_str,
            },
        }
        
        # Get selected advisory
        if option not in advisory_scenarios:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid option. Must be 1 or 2. Got: {option}"
            )
        
        advisory_data = advisory_scenarios[option]
        volcano_id = advisory_data["volcano_id"]
        
        # Fetch current advisory to get previous alert level
        current_result = (
            supabase.table("volcanic_advisories")
            .select("alert_level")
            .eq("volcano_id", volcano_id)
            .execute()
        )
        
        previous_alert_level = None
        if current_result.data and len(current_result.data) > 0:
            previous_alert_level = current_result.data[0].get("alert_level")
        
        # Update volcanic advisory in database
        result = (
            supabase.table("volcanic_advisories")
            .update(advisory_data)
            .eq("volcano_id", volcano_id)
            .execute()
        )
        
        if not result.data:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update volcanic advisory for volcano_id {volcano_id}"
            )
        
        # Fetch volcano details for notification
        volcano_result = (
            supabase.table("volcanoes")
            .select("name, coordinates, province_id")
            .eq("volcano_id", volcano_id)
            .execute()
        )
        
        if not volcano_result.data:
            raise HTTPException(
                status_code=500,
                detail=f"Volcano with id {volcano_id} not found"
            )
        
        volcano = volcano_result.data[0]
        volcano_name = volcano.get("name", "Unknown Volcano")
        
        # Extract coordinates if available
        volcano_lat = None
        volcano_lon = None
        if volcano.get("coordinates"):
            coords_str = volcano["coordinates"]
            # Format: SRID=4326;POINT(lon lat)
            if "POINT" in coords_str:
                coords_part = coords_str.split("POINT(")[1].rstrip(")")
                lon_str, lat_str = coords_part.split()
                volcano_lon = float(lon_str)
                volcano_lat = float(lat_str)
        
        # Fetch province name if available
        province_name = None
        if volcano.get("province_id"):
            province_result = (
                supabase.table("provinces")
                .select("name")
                .eq("province_id", volcano["province_id"])
                .execute()
            )
            if province_result.data:
                province_name = province_result.data[0].get("name")
        
        # Create notification for the updated volcanic advisory
        updated_advisory = result.data[0]
        await notification_service.create_volcanic_advisory_notification(
            volcano_id=volcano_id,
            volcano_name=volcano_name,
            alert_level=advisory_data["alert_level"],
            alert_status=advisory_data["alert_status"],
            previous_alert_level=previous_alert_level,
            volcano_lat=volcano_lat,
            volcano_lon=volcano_lon,
            province_name=province_name,
        )
        
        return {
            "success": True,
            "message": f"Successfully simulated volcanic advisory (option {option})",
            "data": updated_advisory,
            "updated_at": timestamp_str,
            "volcano_name": volcano_name,
            "notification_created": True,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error simulating volcanic advisory: {str(e)}"
        )


@router.post("/reset-volcanic-advisory")
async def reset_volcanic_advisory(
    option: int = Query(
        default=1,
        ge=1,
        le=2,
        description="Select which volcanic advisory to reset (1 or 2)"
    )
):
    """
    Reset a volcanic advisory to null values for testing purposes.
    
    Options:
    - 1: Reset Mt. Isarog (volcano_id 13)
    - 2: Reset Mt. Pinatubo (volcano_id 21)
    """
    
    try:
        # Map option to volcano_id
        volcano_mapping = {
            1: 13,  # Mt. Isarog
            2: 21,  # Mt. Pinatubo
        }
        
        if option not in volcano_mapping:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid option. Must be 1 or 2. Got: {option}"
            )
        
        volcano_id = volcano_mapping[option]
        
        # Get current datetime
        now = datetime.now()
        timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S.%f")
        
        # Reset data - set alert_level to 0 and clear other fields
        reset_data = {
            "alert_level": 0,
            "alert_status": None,
            "bulletin_link": None,
            "issuance_date": None,
            "updated_at": timestamp_str,
        }
        
        # Update volcanic advisory in database
        result = (
            supabase.table("volcanic_advisories")
            .update(reset_data)
            .eq("volcano_id", volcano_id)
            .execute()
        )
        
        if not result.data:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to reset volcanic advisory for volcano_id {volcano_id}"
            )
        
        return {
            "success": True,
            "message": f"Successfully reset volcanic advisory (option {option}, volcano_id {volcano_id})",
            "data": result.data[0],
            "reset_at": timestamp_str,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error resetting volcanic advisory: {str(e)}"
        )


@router.get("/volcanic-advisories-info")
async def get_volcanic_advisories_info():
    """Get information about available volcanic advisory simulation scenarios."""
    
    return {
        "success": True,
        "available_scenarios": {
            "1": {
                "name": "Mt. Isarog",
                "volcano_id": 13,
                "alert_level": 2,
                "alert_status": "Low-level Unrest",
            },
            "2": {
                "name": "Mt. Pinatubo",
                "volcano_id": 21,
                "alert_level": 3,
                "alert_status": "Increased Unrest",
            },
        },
        "usage": {
            "simulate": "POST /api/v1/simulation/simulate-volcanic-advisory?option=<1|2>",
            "reset": "POST /api/v1/simulation/reset-volcanic-advisory?option=<1|2>",
        },
    }
