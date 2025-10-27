"""Dashboard endpoints that aggregate earthquake and volcano telemetry."""

from __future__ import annotations

import json
import math
import os
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.database import supabase


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


_PROVINCE_LOOKUP: Dict[int, str] | None = None


def _load_province_lookup() -> Dict[int, str]:
    global _PROVINCE_LOOKUP
    if _PROVINCE_LOOKUP is None:
        try:
            lookup_path = os.path.join(
                os.path.dirname(__file__),
                "../../../src/lookup/provinces_id.json",
            )
            lookup_path = os.path.abspath(lookup_path)
            with open(lookup_path, "r", encoding="utf-8") as file:
                data = json.load(file)
            _PROVINCE_LOOKUP = {int(item["id"]): item["name"] for item in data}
        except Exception:
            _PROVINCE_LOOKUP = {}
    return _PROVINCE_LOOKUP


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _time_ago(reference: datetime, target: Optional[datetime]) -> Optional[str]:
    if not target:
        return None
    delta = reference - target
    seconds = int(delta.total_seconds())
    if seconds < 0:
        return "just now"
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


def _magnitude_severity(magnitude: Optional[float]) -> str:
    if magnitude is None:
        return "unknown"
    if magnitude >= 6.5:
        return "severe"
    if magnitude >= 5.5:
        return "high"
    if magnitude >= 4.5:
        return "moderate"
    return "low"


def _safe_float(value: Optional[float | int | str]) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


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


def _serialize_earthquake(record: Dict[str, object], now: datetime) -> Dict[str, object]:
    province_lookup = _load_province_lookup()
    event_time = _parse_datetime(record.get("datetime"))
    magnitude = _safe_float(record.get("magnitude"))
    depth = _safe_float(record.get("depth"))
    latitude = _safe_float(record.get("latitude"))
    longitude = _safe_float(record.get("longitude"))
    province_id = record.get("province_id")
    province_name = province_lookup.get(int(province_id)) if isinstance(province_id, (int, float, str)) and str(province_id).isdigit() else None

    return {
        "eq_id": record.get("eq_id"),
        "datetime": record.get("datetime"),
        "time_ago": _time_ago(now, event_time),
        "magnitude": magnitude,
        "severity": _magnitude_severity(magnitude),
        "depth": depth,
        "location": record.get("location"),
        "latitude": latitude,
        "longitude": longitude,
        "province_id": province_id,
        "province_name": province_name,
    }


@router.get("/todays-earthquakes")
async def get_todays_earthquakes():
    """Return the number of earthquakes recorded for the current calendar day."""

    try:
        now = datetime.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        previous_start = start_of_day - timedelta(days=1)

        today_result = (
            supabase.table("latest_earthquakes")
            .select("eq_id", count="exact")
            .gte("datetime", start_of_day.isoformat())
            .execute()
        )
        today_count = today_result.count or 0

        yesterday_result = (
            supabase.table("latest_earthquakes")
            .select("eq_id", count="exact")
            .gte("datetime", previous_start.isoformat())
            .lt("datetime", start_of_day.isoformat())
            .execute()
        )
        yesterday_count = yesterday_result.count or 0

        delta = today_count - yesterday_count
        trend = "up" if delta > 0 else "down" if delta < 0 else "flat"

        latest_events = (
            supabase.table("latest_earthquakes")
            .select("eq_id, datetime, magnitude, depth, location, latitude, longitude, province_id")
            .gte("datetime", start_of_day.isoformat())
            .order("datetime", desc=True)
            .limit(5)
            .execute()
        )
        events = [
            _serialize_earthquake(item, now)
            for item in latest_events.data or []
        ]

        return {
            "success": True,
            "count": today_count,
            "comparison": {
                "previous_day": yesterday_count,
                "difference": delta,
                "trend": trend,
            },
            "window": {
                "start": start_of_day.isoformat(),
                "end": now.isoformat(),
            },
            "recent_events": events,
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/strongest-magnitude")
async def get_strongest_magnitude(hours: int = Query(24, ge=1, le=72)):
    """Return the strongest earthquake recorded within the supplied hours."""

    try:
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
                "success": True,
                "data": None,
                "window": {
                    "start": start_time.isoformat(),
                    "end": now.isoformat(),
                },
            }

        strongest = _serialize_earthquake(result.data[0], now)
        strongest["hours_window"] = hours

        return {
            "success": True,
            "data": strongest,
            "window": {
                "start": start_time.isoformat(),
                "end": now.isoformat(),
            },
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


def _filter_nearby_events(
    events: List[Dict[str, object]],
    latitude: float = 14.6799,
    longitude: float = 120.5421,
    radius_km: float = 100.0,
    now: datetime = datetime.now(),
) -> List[Dict[str, object]]:
    filtered: List[Dict[str, object]] = []
    for item in events:
        lat = _safe_float(item.get("latitude"))
        lon = _safe_float(item.get("longitude"))
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


@router.get("/nearby-earthquakes")
async def get_nearby_earthquakes(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(100.0, ge=1.0, le=500.0),
    hours: int = Query(48, ge=1, le=168),
):
    """Return earthquakes within a radius around the supplied coordinates."""

    try:
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

        if events:
            strongest = max(events, key=lambda item: item.get("magnitude") or 0)
            most_recent = events[0]
        else:
            strongest = None
            most_recent = None

        return {
            "success": True,
            "summary": {
                "count": len(events),
                "radius_km": radius_km,
                "hours_lookback": hours,
                "strongest": strongest,
                "most_recent": most_recent,
            },
            "events": events,
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/risk-level")
async def get_risk_level(
    province_id: Optional[int] = Query(None, description="Optional province filter"),
    hours: int = Query(72, ge=12, le=168),
):
    """Compute a heuristic seismic risk level for the given window."""

    try:
        now = datetime.now()
        start_time = now - timedelta(hours=hours)

        query = supabase.table("latest_earthquakes").select("*").gte(
            "datetime", start_time.isoformat()
        )
        if province_id is not None:
            query = query.eq("province_id", province_id)
        result = query.execute()
        records = result.data or []

        if not records:
            return {
                "success": True,
                "level": "Low",
                "score": 0.0,
                "factors": ["No recorded earthquakes in the selected window"],
                "window": {
                    "start": start_time.isoformat(),
                    "end": now.isoformat(),
                },
            }

        magnitudes = [
            mag
            for mag in (_safe_float(item.get("magnitude")) for item in records)
            if mag is not None
        ]
        depths = [
            depth
            for depth in (_safe_float(item.get("depth")) for item in records)
            if depth is not None
        ]

        strongest = max(magnitudes) if magnitudes else 0
        average_magnitude = sum(magnitudes) / len(magnitudes) if magnitudes else 0
        shallow_events = sum(1 for depth in depths if depth <= 35) if depths else 0

        score = (
            strongest * 1.4
            + average_magnitude * 0.8
            + (len(records) / 5)
            + shallow_events * 0.3
        )
        score = round(min(score, 10.0), 1)

        if score >= 8:
            level = "Very High"
        elif score >= 6:
            level = "High"
        elif score >= 3:
            level = "Moderate"
        else:
            level = "Low"

        province_lookup = _load_province_lookup()
        province_name = (
            province_lookup.get(province_id) if province_id is not None else None
        )

        factors = []
        if strongest >= 5.5:
            factors.append("Recent strong earthquake (≥5.5 Mw)")
        if shallow_events > len(records) / 2:
            factors.append("Majority of quakes at shallow depths")
        if len(records) >= 15:
            factors.append("High earthquake frequency in the last few days")
        if not factors:
            factors.append("Conditions remain relatively stable")

        return {
            "success": True,
            "score": score,
            "level": level,
            "metrics": {
                "strongest_magnitude": strongest,
                "average_magnitude": round(average_magnitude, 2),
                "shallow_event_ratio": round(
                    shallow_events / len(records), 2
                ),
                "total_events": len(records),
            },
            "factors": factors,
            "context": {
                "province_id": province_id,
                "province_name": province_name,
                "hours": hours,
            },
            "window": {
                "start": start_time.isoformat(),
                "end": now.isoformat(),
            },
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/earthquake-frequency")
async def get_earthquake_frequency(days: int = Query(7, ge=3, le=14)):
    """Return daily earthquake counts for the past *days* window."""

    try:
        now = datetime.now()
        start_time = now - timedelta(days=days - 1)
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)

        result = (
            supabase.table("latest_earthquakes")
            .select("province_id, magnitude")
            .gte("datetime", start_time.isoformat())
            .execute()
        )
        records = result.data or []

        day_buckets: Dict[str, Dict[str, float]] = {
            (start_time + timedelta(days=offset)).date().isoformat(): {
                "count": 0,
                "magnitude_sum": 0.0,
            }
            for offset in range(days)
        }

        for item in records:
            event_time = _parse_datetime(item.get("datetime"))
            magnitude = _safe_float(item.get("magnitude"))
            if not event_time:
                continue
            bucket = event_time.date().isoformat()
            if bucket not in day_buckets:
                continue
            day_buckets[bucket]["count"] += 1
            if magnitude is not None:
                day_buckets[bucket]["magnitude_sum"] += magnitude

        data = []
        total_events = 0
        max_count = 0
        for day_str, metrics in day_buckets.items():
            date_obj = datetime.fromisoformat(day_str)
            count = int(metrics["count"])
            total_events += count
            max_count = max(max_count, count)
            avg_magnitude = (
                round(metrics["magnitude_sum"] / count, 2) if count else 0
            )
            data.append(
                {
                    "date": day_str,
                    "label": date_obj.strftime("%b %d"),
                    "weekday": date_obj.strftime("%a"),
                    "count": count,
                    "average_magnitude": avg_magnitude,
                }
            )

        data.sort(key=lambda item: item["date"])

        return {
            "success": True,
            "data": data,
            "summary": {
                "total_events": total_events,
                "daily_average": round(total_events / days, 2) if days else 0,
                "peak": max_count,
            },
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/magnitude-time")
async def get_magnitude_time_chart(hours: int = Query(168, ge=24, le=240)):
    """Return magnitude vs time scatter data for the last *hours* window."""

    try:
        now = datetime.now()
        start_time = now - timedelta(hours=hours)

        result = (
        supabase.table("latest_earthquakes")
        .select("eq_id, datetime, magnitude, depth, location, latitude, longitude, province_id")
            .gte("datetime", start_time.isoformat())
            .order("datetime", desc=True)
            .limit(200)
            .execute()
        )
        records = result.data or []

        points = []
        for item in records:
            event_time = _parse_datetime(item.get("datetime"))
            magnitude = _safe_float(item.get("magnitude"))
            depth = _safe_float(item.get("depth"))
            if not event_time or magnitude is None:
                continue
            hours_since_start = (event_time - start_time).total_seconds() / 3600
            points.append(
                {
                    "datetime": item.get("datetime"),
                    "hours_offset": round(hours_since_start, 2),
                    "magnitude": magnitude,
                    "severity": _magnitude_severity(magnitude),
                    "depth": depth,
                    "location": item.get("location"),
                }
            )

        points.sort(key=lambda item: item["datetime"])

        return {
            "success": True,
            "points": points,
            "window": {
                "start": start_time.isoformat(),
                "end": now.isoformat(),
            },
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/province-activity")
async def get_province_activity(hours: int = Query(24, ge=1, le=168), limit: int = Query(6, ge=3, le=15)):
    """Return earthquake distribution by province for the supplied hours window."""

    try:
        now = datetime.now()
        start_time = now - timedelta(hours=hours)

        result = (
            supabase.table("latest_earthquakes")
            .select("province_id, magnitude, depth")
            .gte("datetime", start_time.isoformat())
            .execute()
        )
        records = result.data or []

        province_lookup = _load_province_lookup()
        counter: Dict[str, Dict[str, float]] = defaultdict(
            lambda: {"count": 0, "max_mag": 0.0}
        )

        for item in records:
            province_id = item.get("province_id")
            province_name = (
                province_lookup.get(int(province_id))
                if isinstance(province_id, (int, float, str)) and str(province_id).isdigit()
                else "Unknown"
            )
            magnitude = _safe_float(item.get("magnitude")) or 0.0
            counter[province_name]["count"] += 1
            counter[province_name]["max_mag"] = max(
                counter[province_name]["max_mag"], magnitude
            )

        total = sum(item["count"] for item in counter.values())

        if total == 0:
            return {
                "success": True,
                "data": [],
                "total": 0,
            }

        sorted_items = sorted(
            counter.items(), key=lambda entry: entry[1]["count"], reverse=True
        )
        top_items = sorted_items[: limit - 1]
        others_count = sum(count for _, metrics in sorted_items[limit - 1 :])

        data = []
        for name, metrics in top_items:
            percentage = round((metrics["count"] / total) * 100, 2)
            data.append(
                {
                    "province": name,
                    "count": int(metrics["count"]),
                    "percentage": percentage,
                    "peak_magnitude": round(metrics["max_mag"], 2),
                }
            )

        if others_count > 0:
            data.append(
                {
                    "province": "Others",
                    "count": int(others_count),
                    "percentage": round((others_count / total) * 100, 2),
                    "peak_magnitude": None,
                }
            )

        return {
            "success": True,
            "data": data,
            "total": int(total),
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/recent-ph")
async def get_recent_earthquakes_ph(limit: int = Query(10, ge=1, le=50)):
    """Return the most recent earthquakes recorded in the Philippines."""

    try:
        now = datetime.now()
        result = (
            supabase.table("latest_earthquakes")
            .select("eq_id, datetime, magnitude, depth, location, latitude, longitude, province_id")
            .order("datetime", desc=True)
            .limit(limit)
            .execute()
        )
        events = [
            _serialize_earthquake(item, now) for item in result.data or []
        ]
        return {
            "success": True,
            "data": events,
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/recent-nearby")
async def get_recent_earthquakes_nearby(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(100.0, ge=1.0, le=500.0),
    limit: int = Query(10, ge=1, le=50),
    hours: int = Query(72, ge=1, le=240),
):
    """Return the most recent earthquakes near the supplied coordinates."""

    try:
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
            "success": True,
            "data": events[:limit],
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/high-risk-provinces")
async def get_high_risk_provinces(days: int = Query(7, ge=3, le=30), limit: int = Query(5, ge=1, le=10)):
    """Return provinces with the highest recent earthquake activity."""

    try:
        now = datetime.now()
        start_time = now - timedelta(days=days)

        result = (
            supabase.table("latest_earthquakes")
            .select("*")
            .gte("datetime", start_time.isoformat())
            .execute()
        )
        records = result.data or []

        province_lookup = _load_province_lookup()
        metrics: Dict[str, Dict[str, float]] = defaultdict(
            lambda: {
                "count": 0,
                "max_mag": 0.0,
                "avg_depth": 0.0,
                "depth_samples": 0,
            }
        )

        for item in records:
            province_id = item.get("province_id")
            province_name = (
                province_lookup.get(int(province_id))
                if isinstance(province_id, (int, float, str)) and str(province_id).isdigit()
                else "Unknown"
            )
            magnitude = _safe_float(item.get("magnitude")) or 0.0
            depth = _safe_float(item.get("depth"))

            province_metrics = metrics[province_name]
            province_metrics["count"] += 1
            province_metrics["max_mag"] = max(province_metrics["max_mag"], magnitude)
            if depth is not None:
                province_metrics["avg_depth"] += depth
                province_metrics["depth_samples"] += 1

        scored = []
        for name, values in metrics.items():
            if values["count"] == 0:
                continue
            avg_depth = (
                values["avg_depth"] / values["depth_samples"]
                if values["depth_samples"]
                else None
            )
            score = (
                values["count"] * 0.4
                + values["max_mag"] * 1.6
                + (5 if avg_depth is not None and avg_depth <= 35 else 0)
            )
            scored.append(
                {
                    "province": name,
                    "event_count": int(values["count"]),
                    "strongest_magnitude": round(values["max_mag"], 2),
                    "average_depth": round(avg_depth, 1) if avg_depth is not None else None,
                    "risk_score": round(score, 2),
                }
            )

        scored.sort(key=lambda item: item["risk_score"], reverse=True)

        return {
            "success": True,
            "data": scored[:limit],
            "window": {
                "start": start_time.isoformat(),
                "end": now.isoformat(),
            },
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


@router.get("/volcanic-advisories")
async def get_volcanic_advisories():
    """Return the latest volcanic advisories."""

    try:
        result = (
            supabase.table("volcanic_advisories")
            .select("volcano_id, alert_level, issuance_date, bulletin_link, alert_status, updated_at")
            .order("alert_level", desc=True)
            .order("issuance_date", desc=True)
            .execute()
        )
        advisories = result.data or []
        for advisory in advisories:
            issuance_date = advisory.get("issuance_date")
            if isinstance(issuance_date, str):
                advisory["issuance_date"] = issuance_date
        return {
            "success": True,
            "data": advisories,
        }
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": str(exc)}


