"""Service for updating volcano advisories in Supabase."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.core.database import supabase
from app.models.volcano import VolcanoAdvisoryData
from app.services.notifications.notification_service import notification_service
from app.services.chatbot.context_manager import context_manager


class VolcanoUpdaterService:
    """Reset and apply volcano advisory updates in the database."""

    def __init__(self) -> None:
        self._volcano_name_lookup: Optional[Dict[int, str]] = None

    async def apply_updates(self, advisories: List[VolcanoAdvisoryData]) -> bool:
        """Replace existing volcano advisory data with the provided list."""

        try:
            # Get current state BEFORE resetting for change detection
            current_advisories_result = (
                supabase.table("volcanic_advisories")
                .select("volcano_id, alert_level")
                .execute()
            )
            
            current_alert_map = {
                adv["volcano_id"]: adv["alert_level"] 
                for adv in current_advisories_result.data
            }

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
            
            # Create notifications for changed/new advisories
            await self._create_notifications_for_changes(advisories, current_alert_map)
            
            # Auto-update volcanic context after advisories are updated
            print("🔄 Auto-updating volcanic context...")
            try:
                await context_manager.update_volcanic_context()
                print("✅ Volcanic context auto-updated successfully")
            except Exception as context_error:
                print(f"⚠️ Failed to auto-update volcanic context: {context_error}")
            
            return True

        except Exception as exc:  # noqa: BLE001
            print(f"❌ Failed to update volcano advisories: {exc}")
            return False

    async def _create_notifications_for_changes(
        self, 
        updated_advisories: List[VolcanoAdvisoryData],
        previous_alert_map: Dict[int, int]
    ) -> None:
        """Create notifications for volcano advisory changes."""
        try:
            volcano_details = await self._load_volcano_names()
            
            for advisory in updated_advisories:
                volcano_id = advisory.volcano_id
                new_alert_level = advisory.alert_level
                
                # Get volcano details
                volcano_info = volcano_details.get(volcano_id, {})
                volcano_name = volcano_info.get("name", f"Volcano {volcano_id}")
                volcano_lat = volcano_info.get("latitude")
                volcano_lon = volcano_info.get("longitude")
                province_name = volcano_info.get("province")
                
                alert_status = advisory.alert_status or "Status unknown"
                
                # Skip if no alert (level 0)
                if new_alert_level == 0:
                    continue
                
                # Get previous alert level
                previous_alert_level = previous_alert_map.get(volcano_id, 0)
                
                # Only create notification if there's a change
                if previous_alert_level != new_alert_level:
                    await notification_service.create_volcanic_advisory_notification(
                        volcano_id=volcano_id,
                        volcano_name=volcano_name,
                        alert_level=new_alert_level,
                        alert_status=alert_status,
                        previous_alert_level=previous_alert_level if previous_alert_level > 0 else None,
                        volcano_lat=volcano_lat,
                        volcano_lon=volcano_lon,
                        province_name=province_name,
                    )
        except Exception as exc:  # noqa: BLE001
            print(f"❌ Error creating volcano notifications: {exc}")

    async def _load_volcano_names(self) -> Dict[int, str]:
        """Load volcano ID to name mapping."""
        if self._volcano_name_lookup is None:
            # Try to load from volcanoes.json (has more details)
            lookup_path = os.path.join(
                os.path.dirname(__file__),
                "../../../../frontend/src/assets/gis/volcanoes.json",
            )
            lookup_path = os.path.abspath(lookup_path)

            if os.path.exists(lookup_path):
                with open(lookup_path, "r", encoding="utf-8") as file:
                    data = json.load(file)
                self._volcano_name_lookup = {
                    entry["id"]: entry for entry in data
                }
            else:
                # Fallback to volcanoes_id.json
                lookup_path = os.path.join(
                    os.path.dirname(__file__),
                    "../../../src/lookup/volcanoes_id.json",
                )
                lookup_path = os.path.abspath(lookup_path)

                with open(lookup_path, "r", encoding="utf-8") as file:
                    data = json.load(file)

                self._volcano_name_lookup = {
                    entry["id"]: {"name": entry["name"]} for entry in data
                }

        return self._volcano_name_lookup

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
                        "updated_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
                    }
                )
                .neq("volcano_id", 0)
                .execute()
            )
            print("🧹 Reset volcanic advisories via fallback update")


volcano_updater = VolcanoUpdaterService()

