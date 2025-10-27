"""Service for updating volcano advisories in Supabase."""

from __future__ import annotations

from typing import List

from app.core.database import supabase
from app.models.volcano import VolcanoAdvisoryData


class VolcanoUpdaterService:
    """Reset and apply volcano advisory updates in the database."""

    async def apply_updates(self, advisories: List[VolcanoAdvisoryData]) -> bool:
        """Replace existing volcano advisory data with the provided list."""

        try:
            await self._reset_alert_levels()

            if not advisories:
                print("🌋 No advisories to upsert after reset")
                return True

            payload = [advisory.model_dump(mode="json") for advisory in advisories]

            (
                supabase.table("volcanic_advisories")
                .upsert(payload, on_conflict="volcano_id")
                .execute()
            )

            print(f"✅ Applied {len(advisories)} volcano advisories")
            return True

        except Exception as exc:  # noqa: BLE001
            print(f"❌ Failed to update volcano advisories: {exc}")
            return False

    async def _reset_alert_levels(self) -> None:
        """Reset alert levels and status before applying new advisories."""

        try:
            supabase.rpc("reset_volcanic_advisories").execute()
            print("🧹 Reset volcanic advisories via RPC")
        except Exception:
            (
                supabase.table("volcanic_advisories")
                .update(
                    {
                        "alert_level": 0,
                        "issuance_date": None,
                        "bulletin_link": None,
                        "alert_status": None,
                        "updated_at": None,
                    }
                )
                .neq("volcano_id", 0)
                .execute()
            )
            print("🧹 Reset volcanic advisories via fallback update")


volcano_updater = VolcanoUpdaterService()

