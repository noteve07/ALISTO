"""Service for scraping volcano advisories from PHIVOLCS."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException

from app.core.config import settings
from app.models.volcano import VolcanoRawAdvisory


class VolcanoScraperService:
    """Scrape volcano advisory bulletins from PHIVOLCS."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.VOLCANO_BULLETIN_URL
        self.timeout = settings.request_timeout

    async def scrape_latest_advisories(self) -> List[VolcanoRawAdvisory]:
        """Return raw volcano advisories scraped from the PHIVOLCS bulletin site."""

        try:
            print(f"🌋 Scraping volcano advisories at {datetime.now()}")

            async with httpx.AsyncClient(verify=False, timeout=self.timeout) as client:
                response = await client.get(self.base_url)

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to fetch volcano data. Status: {response.status_code}",
                    )

            soup = BeautifulSoup(response.content, "html.parser")
            second_columns = soup.find_all("div", class_="col-sm-6 second-column")

            if not second_columns:
                raise HTTPException(status_code=404, detail="No volcano advisories found")

            advisories: List[VolcanoRawAdvisory] = []

            for column in second_columns:
                advisory = await self._parse_column(column)
                if advisory:
                    advisories.append(advisory)

            print(f"✅ Scraped {len(advisories)} volcano advisories")
            return advisories

        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Network error: {exc}") from exc
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=500, detail=f"Scraping error: {exc}") from exc

    async def _parse_column(self, column) -> Optional[VolcanoRawAdvisory]:  # type: ignore[override]
        """Parse a PHIVOLCS bulletin column into a raw advisory."""

        text_p = column.find("p", style=lambda x: x and "font-size:18px" in x)
        volcano_name = ""
        issuance_date = ""

        if text_p:
            full_text = text_p.get_text(strip=True)

            name_match = None
            if full_text:
                import re

                name_match = re.match(r"(\w+)\s+Volcano", full_text)
                date_match = re.search(r"(\d{1,2}\s+\w+\s+\d{4})", full_text)

                if name_match:
                    volcano_name = name_match.group(1)
                if date_match:
                    issuance_date = date_match.group(1)

        anchor = column.find("a", href=True)
        iframe_link = None

        if anchor:
            iframe_link = anchor["href"]
        else:
            iframe = column.find("iframe")
            if iframe and iframe.get("src"):
                iframe_link = iframe.get("src")

        if not iframe_link:
            return None

        from urllib.parse import urljoin
        import re

        full_url = urljoin(settings.VOLCANO_BASE_URL + "/", iframe_link)
        bulletin_id = None
        match = re.search(r"bid=(\d+)", full_url)
        if match:
            bulletin_id = match.group(1)

        alert_level = "Not found"
        alert_status = "Not found"

        try:
            async with httpx.AsyncClient(timeout=15, verify=False) as client:
                target_resp = await client.get(full_url)
                if target_resp.status_code == 200:
                    iframe_soup = BeautifulSoup(target_resp.text, "html.parser")
                    circle_div = iframe_soup.find("div", class_="circle")
                    if circle_div:
                        alert_level = circle_div.get_text(strip=True)

                    status_p = iframe_soup.find("p", class_="txt-status")
                    if status_p:
                        alert_status = status_p.get_text(strip=True).strip("()")
        except httpx.RequestError:
            pass

        return VolcanoRawAdvisory(
            volcano_name=volcano_name,
            date=issuance_date,
            iframe_link=full_url,
            bulletin_id=bulletin_id or "",
            alert_level=alert_level,
            alert_status=alert_status,
        )


volcano_scraper = VolcanoScraperService()
