"""Test endpoints for simulating earthquake data."""

from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.services.live.earthquakes.earthquake_updater import earthquake_updater


router = APIRouter(prefix="/test", tags=["Test"])


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
    - 1: Northern Samar (Mag 2.9, Shallow)
    - 2: Bataan - Mariveles (Mag 2.4, Deep)
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
                "magnitude": 2.9,
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
        "usage": "POST /api/v1/test/simulate-earthquake?option=<1|2|3>",
    }
