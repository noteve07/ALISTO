"""
Simple location utility using the existing SQL function.
"""
from typing import Dict, Any
from supabase import Client
import logging

logger = logging.getLogger(__name__)


def get_location_from_coords(supabase: Client, lat: float, lon: float) -> Dict[str, Any]:
    """
    Get municipality and province from coordinates using the SQL function.
    Uses the existing find_location_from_coords PostgreSQL function.
    """
    try:
        logger.info(f"Finding location for coordinates: {lat}, {lon}")
        
        # Call the SQL function via Supabase RPC
        result = supabase.rpc(
            'find_location_from_coords',
            {'input_lat': lat, 'input_lon': lon}
        ).execute()
        
        if result.data and len(result.data) > 0:
            location = result.data[0]
            logger.info(f"Found location: {location['municity_name']}, {location['province_name']}")
            
            return {
                "municipality_id": int(location['municity_id']) if location.get('municity_id') is not None else None,
                "municipality_name": location['municity_name'],
                "province_id": int(location['province_id']) if location.get('province_id') is not None else None,
                "province_name": location['province_name'],
                "latitude": lat,
                "longitude": lon,
                "found_by": "sql_function"
            }
        else:
            logger.warning(f"No municipality found for coordinates {lat}, {lon}. Using Balanga City fallback.")
            return _get_balanga_fallback(supabase, lat, lon)
            
    except Exception as e:
        logger.error(f"Error calling SQL function: {str(e)}")
        return _get_balanga_fallback(supabase, lat, lon, error=str(e))


def _get_balanga_fallback(supabase: Client, lat: float, lon: float, error: str = None) -> Dict[str, Any]:
    """
    Get Balanga City fallback data from database.
    """
    try:
        # Try to get actual Balanga City IDs from database
        result = supabase.table("municities").select(
            "municity_id, name, province_id, provinces(name)"
        ).ilike("name", "%Balanga%").execute()
        
        if result.data and len(result.data) > 0:
            municipality = result.data[0]
            logger.info(f"Using Balanga City fallback from database: {municipality}")
            
            return {
                "municipality_id": int(municipality.get("municity_id")) if municipality.get("municity_id") is not None else None,
                "municipality_name": municipality.get("name"),
                "province_id": int(municipality.get("province_id")) if municipality.get("province_id") is not None else None,
                "province_name": municipality.get("provinces", {}).get("name") if municipality.get("provinces") else None,
                "latitude": lat,
                "longitude": lon,
                "is_fallback": True,
                "found_by": "fallback_db",
                "error": error
            }
    except Exception as db_error:
        logger.error(f"Error getting Balanga City from database: {str(db_error)}")
    
    # Return hardcoded fallback if database query fails
    return {
        "municipality_id": None,
        "municipality_id": None,
        "municipality_name": "Balanga City",
        "province_id": None,
        "province_name": "Bataan",
        "latitude": lat,
        "longitude": lon,
        "is_fallback": True,
        "found_by": "hardcoded_fallback",
        "error": error
    }
