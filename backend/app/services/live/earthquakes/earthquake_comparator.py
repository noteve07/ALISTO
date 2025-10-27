"""Service for detecting new earthquakes compared to stored records."""

from __future__ import annotations

from typing import List

from app.core.database import supabase
from app.models.earthquake import EarthquakeData


class EarthquakeComparatorService:
    """Compare scraped earthquakes with existing Supabase records."""

    async def check_for_new_earthquakes(
        self, scraped_earthquakes: List[EarthquakeData]
    ) -> List[EarthquakeData]:
        """Return earthquakes not yet stored in Supabase."""

        if not scraped_earthquakes:
            return []

        try:
            db_result = (
                supabase.table("latest_earthquakes")
                .select("eq_id")
                .order("datetime", desc=True)
                .limit(1)
                .execute()
            )

            if not db_result.data:
                print("📝 Database is empty - all earthquakes are new")
                return scraped_earthquakes

            db_top_id = db_result.data[0]["eq_id"]
            scraped_top_id = scraped_earthquakes[0]["eq_id"]

            if db_top_id == scraped_top_id:
                print("✅ No new earthquakes found")
                return []

            new_earthquakes = []
            for earthquake in scraped_earthquakes:
                existing = (
                    supabase.table("latest_earthquakes")
                    .select("eq_id")
                    .eq("eq_id", earthquake["eq_id"])
                    .execute()
                )

                if not existing.data:
                    new_earthquakes.append(earthquake)
                else:
                    break

            print(f"🆕 Found {len(new_earthquakes)} new earthquakes")
            return new_earthquakes

        except Exception as e:
            print(f"❌ Error checking for new earthquakes: {e}")
            return []


earthquake_comparator = EarthquakeComparatorService()

