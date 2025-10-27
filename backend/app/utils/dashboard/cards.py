"""Card-level metrics for the dashboard."""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from app.core.database import supabase


DEFAULT_LATITUDE = 14.6799
DEFAULT_LONGITUDE = 120.5421


def _parse_float(value: Optional[float | int | str]) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _serialize_earthquake(record: Dict[str, Any], reference: datetime) -> Dict[str, Any]:
    event_time_raw = record.get("datetime")
    try:
        event_time = datetime.fromisoformat(str(event_time_raw).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        event_time = None

    magnitude = _parse_float(record.get("magnitude"))
    depth = _parse_float(record.get("depth"))

    return {
        "eq_id": record.get("eq_id"),
        "datetime": event_time_raw,
        "time_ago": _time_ago(reference, event_time),
        "magnitude": magnitude,
        "depth": depth,
        "location": record.get("location"),
        "latitude": _parse_float(record.get("latitude")),
        "longitude": _parse_float(record.get("longitude")),
    }


def _time_ago(reference: datetime, event_time: Optional[datetime]) -> Optional[str]:
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


def _bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    diff_long = math.radians(lon2 - lon1)
    x = math.sin(diff_long) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_long)
    initial_bearing = math.degrees(math.atan2(x, y))
    return (initial_bearing + 360) % 360


def _direction(lat1: float, lon1: float, lat2: float, lon2: float) -> str:
    bearing = _bearing(lat1, lon1, lat2, lon2)
    compass = [
        "North",
        "North-East",
        "East",
        "South-East",
        "South",
        "South-West",
        "West",
        "North-West",
    ]
    idx = int((bearing + 22.5) // 45) % 8
    return compass[idx]


def _filter_nearby_events(
    events: List[Dict[str, Any]],
    latitude: float,
    longitude: float,
    radius_km: float,
    now: datetime,
) -> List[Dict[str, object]]:
    filtered: List[Dict[str, object]] = []
    for item in events:
        lat = _parse_float(item.get("latitude"))
        lon = _parse_float(item.get("longitude"))
        if lat is None or lon is None:
            continue
        distance = _haversine_distance(latitude, longitude, lat, lon)
        if distance <= radius_km:
            serialized = _serialize_earthquake(item, now)
            serialized["distance_km"] = round(distance, 2)
            serialized["direction"] = _direction(latitude, longitude, lat, lon)
            filtered.append(serialized)
    filtered.sort(key=lambda event: event.get("datetime"), reverse=True)
    return filtered


async def get_todays_earthquakes() -> Dict[str, int]:
    """Return only today's earthquake count."""

    now = datetime.now()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

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

    result = (
        supabase.table("latest_earthquakes")
        .select("eq_id, datetime, magnitude, depth, location, latitude, longitude, province_id")
        .gte("datetime", start_time.isoformat())
        .order("magnitude", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {
            "data": None,
        }

    strongest = _serialize_earthquake(result.data[0], now)
    strongest["hours_window"] = hours

    return {
        "data": strongest,
        "window": {
            "start": start_time.isoformat(),
            "end": now.isoformat(),
        },
    }


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

    strongest = max(events, key=lambda item: item.get("magnitude") or 0) if events else None
    most_recent = events[0] if events else None

    return {
        "summary": {
            "count": len(events),
            "radius_km": radius_km,
            "hours_lookback": hours,
            "strongest": strongest,
            "most_recent": most_recent,
        },
        "events": events,
    }


async def get_risk_level(*args, **kwargs):  # noqa: ANN001, ANN002
    """Placeholder for dashboard risk computation."""

    # Not implemented yet – returning placeholder.
    return None



