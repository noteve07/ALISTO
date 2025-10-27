"""Service for comparing volcano advisories with database state."""

from __future__ import annotations

from typing import List

from app.models.volcano import VolcanoAdvisoryData


class VolcanoComparatorService:
    """Placeholder comparator for volcano advisories (no diffing needed)."""

    async def select_latest(self, advisories: List[VolcanoAdvisoryData]) -> List[VolcanoAdvisoryData]:
        """Return processed advisories unchanged (full refresh expected)."""

        return advisories


volcano_comparator = VolcanoComparatorService()

