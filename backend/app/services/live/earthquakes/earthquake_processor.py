"""Utility service for processing scraped earthquake records."""

from __future__ import annotations

import hashlib
import os
import json
import re
from datetime import datetime
from typing import Any, Dict, List

from app.models.earthquake import EarthquakeRawData, EarthquakeData


class EarthquakeProcessorService:
    """Transform raw PHIVOLCS rows into normalized earthquake payloads."""

    async def process_earthquakes(self, raw_earthquakes: List[EarthquakeRawData]) -> List[EarthquakeData]:
        """Convert raw earthquake entries to DB-ready records."""

        try:
            print("🔄 Processing earthquakes data...")

            seen_eq_ids = set()
            processed_earthquake_row = []
            for eq in raw_earthquakes:
                datetime_iso = self.parse_datetime_string(eq.datetime)
                if datetime_iso is None:
                    print(f"⚠️ Skipping earthquake due to invalid datetime: {eq.datetime}")
                    return None

                province_name = await self.extract_province(eq.location)
                province_id = await self.get_province_id(province_name)

                eq_dict = {
                    "datetime": datetime_iso,
                    "latitude": eq.latitude,
                    "longitude": eq.longitude,
                    "coordinates": "SRID=4326;POINT(120.984222 14.599512)",
                    "depth": eq.depth,
                    "magnitude": eq.magnitude,
                    "location": eq.location,
                    "province_id": province_id,
                }

                eq_id = await self.generate_eq_hash(eq_dict)

                if eq_id in seen_eq_ids:
                    continue

                seen_eq_ids.add(eq_id)
                eq_dict["eq_id"] = eq_id
                processed_earthquake_row.append(eq_dict)

            print(f"✅ Processed {len(processed_earthquake_row)} earthquakes with hashes")
            return processed_earthquake_row

        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return []

    def parse_datetime_string(self, date_string: str) -> str | None:
        """Parse PHIVOLCS datetime string to ISO format string."""

        try:
            if " - " in date_string:
                date_part, time_part = date_string.split(" - ")
                dt_format = "%d %B %Y %I:%M %p"
                dt_obj = datetime.strptime(f"{date_part} {time_part}", dt_format)
                return dt_obj.isoformat()
            dt_obj = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
            return dt_obj.isoformat()
        except Exception as e:
            print(f"❌ Failed to parse datetime: {date_string}, error: {e}")
            return None

    async def extract_province(self, location: str) -> str:
        """Extract province name from location for each earthquake data."""

        matches = re.findall(r"\(([^)]+)\)", str(location))
        if len(matches) == 0:
            return ""
        if len(matches) == 1:
            return matches[0]
        return matches[-1]

    async def get_province_id(self, province_name: str) -> int:
        """Look up province id from province name using local provinces_id.json."""

        if not province_name:
            return None
        try:
            if not hasattr(self, "_province_id_map"):
                json_path = os.path.join(
                    os.path.dirname(__file__),
                    "../../../src/lookup/provinces_id.json",
                )
                json_path = os.path.abspath(json_path)
                with open(json_path, "r", encoding="utf-8") as f:
                    self._province_id_map = json.load(f)
            key = province_name.strip().lower()
            return self._province_id_map.get(key, None)
        except Exception as e:
            print(f"❌ Province lookup failed for {province_name}: {e}")
            return None

    async def generate_eq_hash(self, earthquake: Dict[str, Any]) -> str:
        """Generate unique hash for earthquake using timestamp + magnitude + province."""

        timestamp = str(earthquake.get("datetime", ""))
        magnitude = str(earthquake.get("magnitude", ""))
        location = str(earthquake.get("location", ""))

        combined = f"{timestamp}_{magnitude}_{location}"

        eq_hash = hashlib.md5(combined.encode()).hexdigest()
        return eq_hash


earthquake_processor = EarthquakeProcessorService()

