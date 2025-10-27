"""Service for processing raw volcano advisories into structured data."""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

from app.models.volcano import VolcanoAdvisoryData, VolcanoRawAdvisory


class VolcanoProcessorService:
    """Normalize volcano advisories prior to database updates."""

    def __init__(self) -> None:
        self._volcano_lookup: Optional[Dict[str, int]] = None

    async def process_advisories(
        self, advisories: List[VolcanoRawAdvisory]
    ) -> List[VolcanoAdvisoryData]:
        """Convert raw advisories into typed payloads and map volcano IDs."""

        processed: List[VolcanoAdvisoryData] = []
        print("🔄 Processing volcano advisories...")

        for advisory in advisories:
            volcano_id = await self.get_volcano_id(advisory.volcano_name)
            if volcano_id is None:
                print(
                    f"⚠️ Skipping advisory for unknown volcano: {advisory.volcano_name}"
                )
                continue

            issuance_date = await self.parse_date(advisory.date)
            if issuance_date is None:
                print(
                    f"⚠️ Skipping advisory due to invalid date: {advisory.date}"
                )
                continue

            alert_level = await self.parse_alert_level(advisory.alert_level)

            processed.append(
                VolcanoAdvisoryData(
                    volcano_id=volcano_id,
                    alert_level=alert_level,
                    issuance_date=issuance_date,
                    bulletin_link=advisory.iframe_link,
                    alert_status=advisory.alert_status or None,
                )
            )

        print(f"✅ Processed {len(processed)} volcano advisories")
        return processed

    async def parse_date(self, date_str: str):
        """Parse advisory issuance date into date object."""

        try:
            dt = datetime.strptime(date_str, "%d %B %Y")
            return dt.date()
        except Exception as exc:  # noqa: BLE001
            print(f"❌ Failed to parse issuance date '{date_str}': {exc}")
            return None

    async def parse_alert_level(self, level_str: str) -> int:
        """Convert alert level text into an integer."""

        if not level_str:
            return 0

        import re

        match = re.search(r"(\d+)", level_str)
        if match:
            try:
                value = int(match.group(1))
                return max(0, min(5, value))
            except ValueError:
                pass

        level_str = level_str.strip().lower()
        mapping = {
            "alert level 0": 0,
            "alert level 1": 1,
            "alert level 2": 2,
            "alert level 3": 3,
            "alert level 4": 4,
            "alert level 5": 5,
            "no alert": 0,
        }

        return mapping.get(level_str, 0)

    async def get_volcano_id(self, name: str) -> Optional[int]:
        """Lookup volcano ID by human-readable name (case-insensitive)."""

        if not name:
            return None

        lookup = await self._load_lookup()
        return lookup.get(name.strip().lower())

    async def _load_lookup(self) -> Dict[str, int]:
        """Load and cache volcano name → ID mapping."""

        if self._volcano_lookup is None:
            lookup_path = os.path.join(
                os.path.dirname(__file__),
                "../../../src/lookup/volcanoes_id.json",
            )
            lookup_path = os.path.abspath(lookup_path)

            with open(lookup_path, "r", encoding="utf-8") as file:
                data = json.load(file)

            self._volcano_lookup = {
                entry["name"].strip().lower(): entry["id"] for entry in data
            }

        return self._volcano_lookup


volcano_processor = VolcanoProcessorService()