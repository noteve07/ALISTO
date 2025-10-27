"""Volcano-related Pydantic models."""

from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel


class VolcanoRawAdvisory(BaseModel):
    """Raw data scraped from PHIVOLCS volcano bulletin."""

    volcano_name: str
    date: str
    iframe_link: str
    bulletin_id: str
    alert_level: str
    alert_status: str


class VolcanoAdvisoryData(BaseModel):
    """Processed volcano advisory ready for persistence."""

    volcano_id: int
    alert_level: int
    issuance_date: date
    bulletin_link: str
    alert_status: Optional[str]


