"""Card-level metrics for the dashboard."""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from app.core.database import supabase


DEFAULT_LATITUDE = 14.6799
DEFAULT_LONGITUDE = 120.5421

    
async def get_todays_earthquakes() -> Dict[str, int]:
    """Return only today's earthquake count."""

    now = datetime.now()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # query the database to get the earthquake for the current day
    today_result = (
        supabase.table("latest_earthquakes")
        .select("eq_id", count="exact")
        .gte("datetime", start_of_day.isoformat())
        .execute()
    )
    today_count = today_result.count or 0

    return {"count": today_count}




async def get_strongest_magnitude(hours: int = 24) -> Dict[str, object]:
    """Fetch the strongest earthquake within the given hour window."""
    now = datetime.now()
    start_time = now - timedelta(hours=hours)

    # query the database to get the highest magnitude (last 24 hours)
    result = (
        supabase.table("latest_earthquakes")
        .select("datetime, magnitude, location, latitude, longitude")
        .gte("datetime", start_time.isoformat())
        .order("magnitude", desc=True)
        .limit(1)
        .execute()
    )

    # data fallback if result is empty
    if not result.data:
        return {"data": None}
    record = result.data[0]

    # get the formatted datetime for time_ago calculation
    try:
        event_time = datetime.fromisoformat(str(record.get("datetime")).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        event_time = None

    # calculate time elapsed to current datetime from event_time
    time_ago = _calculate_time_ago(now, event_time)

    return {
        "magnitude": record.get("magnitude"),
        "location": record.get("location"),
        "latitude": record.get("latitude"),
        "longitude": record.get("longitude"),
        "time_ago": time_ago
    }


def _calculate_time_ago(reference: datetime, event_time: Optional[datetime]) -> Optional[str]:
    if not event_time:
        return None
    delta = reference - event_time
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return f"{seconds}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"




async def get_nearby_earthquakes(
    latitude: float = DEFAULT_LATITUDE,
    longitude: float = DEFAULT_LONGITUDE,
    radius_km: float = 100.0,
    hours: int = 48,
) -> Dict[str, object]:
    """Fetch earthquakes near the provided coordinates within the radius."""

    now = datetime.now()
    start_time = now - timedelta(hours=hours)

    result = (
        supabase.table("latest_earthquakes")
        .select("eq_id, datetime, magnitude, depth, location, latitude, longitude, province_id")
        .gte("datetime", start_time.isoformat())
        .order("datetime", desc=True)
        .limit(500)
        .execute()
    )
    events = _filter_nearby_events(result.data or [], latitude, longitude, radius_km, now)

    return {
        "count": len(events),
        "radius_km": radius_km,
        "events": events
    }


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c


def _filter_nearby_events(events: List[Dict[str, Any]], latitude: float, longitude: float, 
                          radius_km: float, now: datetime) -> List[Dict[str, object]]:
    filtered: List[Dict[str, object]] = []
    for item in events:
        lat = float(item.get("latitude"))
        lon = float(item.get("longitude"))
        if lat is None or lon is None:
            continue
        distance = _haversine_distance(latitude, longitude, lat, lon)
        if distance <= radius_km:
            serialized = _serialize_earthquake(item, now)
            serialized["distance_km"] = round(distance, 2)
            filtered.append(serialized)
    filtered.sort(key=lambda event: event.get("datetime"), reverse=True)
    return filtered


def _serialize_earthquake(record: Dict[str, Any], reference: datetime) -> Dict[str, Any]:
    event_time_raw = record.get("datetime")
    try:
        event_time = datetime.fromisoformat(str(event_time_raw).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        event_time = None

    return {
        "eq_id": record.get("eq_id"),
        "datetime": event_time_raw,
        "time_ago": _calculate_time_ago(reference, event_time),
        "magnitude": record.get("magnitude"),
        "depth": record.get("depth"),
        "location": record.get("location"),
        "latitude": record.get("latitude"),
        "longitude": record.get("longitude"),
    }





async def get_risk_level(*args, **kwargs):  # noqa: ANN001, ANN002
    """Placeholder for dashboard risk computation."""

    # Not implemented yet – returning placeholder.
    return None



