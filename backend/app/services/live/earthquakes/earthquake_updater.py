"""Service for persisting earthquake updates into Supabase."""

from __future__ import annotations

from typing import Any, Dict, List

from app.core.database import supabase


class EarthquakeUpdaterService:
    """Persist new earthquakes and manage cleanup of stale records."""

    async def add_or_skip_earthquakes(self, new_earthquakes: List[Dict[str, Any]]) -> bool:
        """Insert new earthquake rows if available, otherwise skip."""

        if not new_earthquakes:
            print("⏭️ No new earthquakes to add - skipping")
            return True

        try:
            result = (
                supabase.table("latest_earthquakes")
                .insert(new_earthquakes)
                .execute()
            )

            print(
                f"✅ Successfully added {len(result.data)} new earthquakes to database"
            )

            await self.cleanup_old_records()

            return True

        except Exception as e:
            print(f"❌ Failed to add earthquakes to database: {e}")
            return False

    async def cleanup_old_records(self, keep_count: int = 10_000):
        """Keep only the most recent earthquakes in database."""

        try:
            count_result = (
                supabase.table("latest_earthquakes")
                .select("*", count="exact")
                .execute()
            )

            total_count = count_result.count

            if total_count > keep_count:
                old_records = (
                    supabase.table("latest_earthquakes")
                    .select("id")
                    .order("datetime", desc=False)
                    .limit(total_count - keep_count)
                    .execute()
                )

                if old_records.data:
                    old_ids = [record["id"] for record in old_records.data]

                    (
                        supabase.table("latest_earthquakes")
                        .delete()
                        .in_("id", old_ids)
                        .execute()
                    )

                    print(f"🧹 Cleaned up {len(old_ids)} old earthquake records")

        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")


earthquake_updater = EarthquakeUpdaterService()

