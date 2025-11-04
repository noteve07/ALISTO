"""Dashboard chart utilities."""
from datetime import datetime, timedelta
import math
from app.core.database import supabase

DEFAULT_LATITUDE = 14.6799
DEFAULT_LONGITUDE = 120.5421


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula."""
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


async def get_nearby_earthquakes_7days(province_id: int = 10) -> int:
    """Get count of earthquakes in a province for the last 7 days. Default is Bataan (province_id=10)."""
    try:
        # Calculate date 8 days ago to exclude today
        eight_days_ago = datetime.now() - timedelta(days=8)
        eight_days_ago_str = eight_days_ago.isoformat()
        
        # Fetch earthquakes from last 7 days in the specified province
        response = supabase.table("latest_earthquakes") \
            .select("eq_id") \
            .eq("province_id", province_id) \
            .gte("datetime", eight_days_ago_str) \
            .execute()
        
        return len(response.data) if response.data else 0
    except Exception as e:
        print(f"Error fetching earthquakes for province {province_id} (7 days): {e}")
        return 0


async def get_earthquake_frequency() -> dict:
    """Get earthquake frequency count for the last 7 days (excluding today)."""
    try:
        # Calculate date 8 days ago to exclude today
        eight_days_ago = datetime.now() - timedelta(days=8)
        eight_days_ago_str = eight_days_ago.isoformat()
        
        # Fetch earthquakes from last 7 days (excluding today)
        response = supabase.table("latest_earthquakes") \
            .select("datetime, magnitude") \
            .gte("datetime", eight_days_ago_str) \
            .order("datetime", desc=False) \
            .execute()
        
        earthquakes = response.data
        
        # Group by day and count by magnitude ranges (last 7 days, excluding today)
        daily_counts = {}
        now = datetime.now()
        
        for i in range(7):
            date = now - timedelta(days=7-i)  # Start from 7 days ago
            day_key = date.strftime("%Y-%m-%d")
            daily_counts[day_key] = {
                "below_3": 0,      # < 3.0
                "between_3_5": 0,  # 3.0 - 5.0
                "above_5": 0       # > 5.0
            }
        
        # Count earthquakes per day by magnitude range
        for eq in earthquakes:
            eq_datetime_str = eq["datetime"]
            magnitude = eq["magnitude"]
            
            # Parse datetime and convert to local date
            if "T" in eq_datetime_str:
                eq_date = datetime.fromisoformat(eq_datetime_str.replace("Z", "+00:00"))
            else:
                eq_date = datetime.fromisoformat(eq_datetime_str)
            
            # Use the date part only (ignore timezone for grouping)
            day_key = eq_date.strftime("%Y-%m-%d")
            if day_key in daily_counts:
                if magnitude < 3.0:
                    daily_counts[day_key]["below_3"] += 1
                elif magnitude <= 5.0:
                    daily_counts[day_key]["between_3_5"] += 1
                else:
                    daily_counts[day_key]["above_5"] += 1
        
        # Format response
        data = []
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        for i in range(7):
            date = now - timedelta(days=7-i)  # Start from 7 days ago
            day_key = date.strftime("%Y-%m-%d")
            counts = daily_counts[day_key]
            
            data.append({
                "day": f"{month_names[date.month - 1]} {date.day}",
                "label": day_names[date.weekday()],
                "below_3": counts["below_3"],
                "between_3_5": counts["between_3_5"],
                "above_5": counts["above_5"],
                "total": counts["below_3"] + counts["between_3_5"] + counts["above_5"]
            })
        
        max_count = max([d["total"] for d in data]) if data else 1
        
        # Calculate statistics
        total_week = sum([d["total"] for d in data])
        daily_average = round(total_week / 7) if data else 0
        peak_day = max_count
        
        return {
            "title": "Last 7 Days - Earthquake Frequency",
            "subtitle": "Philippines",
            "data": data,
            "maxCount": max_count,
            "statistics": {
                "total_week": total_week,
                "daily_average": daily_average,
                "peak_day": peak_day
            }
        }
        
    except Exception as e:
        print(f"Error fetching earthquake frequency: {e}")
        return None


async def get_magnitude_time_chart(*args, **kwargs):  # noqa: ANN001, ANN002
    # Not implemented yet – returning placeholder.
    return None


async def get_province_activity() -> dict:
    """Get earthquake activity by province for the last 7 days (excluding today)."""
    try:
        # Calculate date 8 days ago to exclude today
        eight_days_ago = datetime.now() - timedelta(days=8)
        eight_days_ago_str = eight_days_ago.isoformat()
        
        # Fetch earthquakes from last 7 days with province_id
        response = supabase.table("latest_earthquakes") \
            .select("province_id") \
            .gte("datetime", eight_days_ago_str) \
            .not_.is_("province_id", "null") \
            .execute()
        
        earthquakes = response.data
        
        # Count earthquakes by province_id
        province_counts = {}
        for eq in earthquakes:
            province_id = eq.get("province_id")
            if province_id:
                province_counts[province_id] = province_counts.get(province_id, 0) + 1
        
        # Load province lookup (reverse mapping: id -> name)
        import json
        import os
        
        # Get the path to provinces_id.json
        lookup_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "src", "lookup", "provinces_id.json"
        )
        
        with open(lookup_path, "r", encoding="utf-8") as f:
            provinces_name_to_id = json.load(f)
        
        # Create reverse mapping (id -> name)
        provinces_id_to_name = {}
        for name, pid in provinces_name_to_id.items():
            if pid not in provinces_id_to_name:
                provinces_id_to_name[pid] = name.title()
        
        # Format data for chart
        data = []
        for province_id, count in province_counts.items():
            province_name = provinces_id_to_name.get(province_id, f"Province {province_id}")
            data.append({
                "province": province_name,
                "count": count
            })
        
        # Sort by count descending and take top 10
        data.sort(key=lambda x: x["count"], reverse=True)
        top_provinces = data[:10]
        
        # Calculate total for percentage
        total_count = sum([p["count"] for p in top_provinces])
        
        # Get nearby earthquake count using default location
        nearby_count = await get_nearby_earthquakes_7days()
        
        return {
            "title": "Provincial Earthquake Activity",
            "subtitle": "Last 7 Days",
            "data": top_provinces,
            "total": total_count,
            "nearby_count": nearby_count
        }
        
    except Exception as e:
        print(f"Error fetching province activity: {e}")
        return None

