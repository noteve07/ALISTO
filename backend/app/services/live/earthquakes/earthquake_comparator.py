"""Service for detecting new earthquakes compared to stored records."""

from __future__ import annotations

from typing import List

from app.core.database import supabase
from app.models.earthquake import EarthquakeData


class EarthquakeComparatorService:
    """Compare scraped earthquakes with existing Supabase records."""

    @staticmethod
    def _build_key(record) -> str:
        """Build stable comparison key independent of eq_id type/schema."""
        dt = str(record.get("datetime", "")).strip()
        mag = str(record.get("magnitude", "")).strip()
        loc = str(record.get("location", "")).strip()
        return f"{dt}|{mag}|{loc}"

    async def check_for_new_earthquakes(
        self, scraped_earthquakes: List[EarthquakeData]
    ) -> List[EarthquakeData]:
        """Return earthquakes not yet stored in Supabase."""

        if not scraped_earthquakes:
            return []

        try:
            db_result = (
                supabase.table("earthquakes")
                .select("datetime,magnitude,location")
                .order("datetime", desc=True)
                .limit(5000)
                .execute()
            )

            if not db_result.data:
                print("📝 Database is empty - all earthquakes are new")
                return scraped_earthquakes

            existing_keys = {self._build_key(row) for row in db_result.data}
            scraped_top_key = self._build_key(scraped_earthquakes[0])

            if scraped_top_key in existing_keys:
                print("✅ No new earthquakes found")
                return []

            new_earthquakes = []
            for earthquake in scraped_earthquakes:
                eq_key = self._build_key(earthquake)
                if eq_key not in existing_keys:
                    new_earthquakes.append(earthquake)
                else:
                    # Scraped rows are newest-first, so first overlap likely marks boundary.
                    break

            print(f"🆕 Found {len(new_earthquakes)} new earthquakes")
            return new_earthquakes

        except Exception as e:
            print(f"❌ Error checking for new earthquakes: {e}")
            return []


earthquake_comparator = EarthquakeComparatorService()

