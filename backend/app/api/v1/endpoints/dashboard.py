"""Single dashboard endpoint aggregating card, chart, and list data."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.utils.dashboard.cards import (
    get_nearby_earthquakes,
    get_strongest_magnitude,
    get_todays_earthquakes,
    get_risk_level,
)
from app.utils.dashboard.charts import (
    get_earthquake_frequency,
    get_magnitude_time_chart,
    get_province_activity,
)
from app.utils.dashboard.lists import (
    get_recent_nearby_earthquakes,
    get_recent_ph_earthquakes,
    get_high_risk_provinces,
)
from app.utils.dashboard.advisories import get_volcanic_advisories


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard_data(
    user_id: int | None = Query(None),
    lat: float = Query(14.6799),
    lon: float = Query(120.5421),
):
    try:
        today = await get_todays_earthquakes()
        strongest = await get_strongest_magnitude()
        nearby = await get_nearby_earthquakes(latitude=lat, longitude=lon)

        charts = {
            "frequency": await get_earthquake_frequency(),
            "magnitude_time": await get_magnitude_time_chart(),
            "province_activity": await get_province_activity(),
        }

        lists = {
            "recent_ph": await get_recent_ph_earthquakes(),
            "recent_nearby": await get_recent_nearby_earthquakes(latitude=lat, longitude=lon),
            "high_risk_provinces": await get_high_risk_provinces(),
            "volcanic_advisories": await get_volcanic_advisories(),
        }

        return {
            "today_earthquakes": today,
            "strongest_magnitude": strongest,
            "nearby_earthquakes": nearby,
            "risk_level": await get_risk_level(),  # Now always calls for Bataan (province_id=10)
            "charts": charts,
            "lists": lists,
        }
    except NotImplementedError as err:
        raise HTTPException(status_code=501, detail=str(err)) from err
 
