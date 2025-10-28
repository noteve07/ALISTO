"""Async scheduler orchestrating volcano advisory updates."""

from __future__ import annotations

import asyncio
import time
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.services.live.volcanoes.volcano_comparator import volcano_comparator
from app.services.live.volcanoes.volcano_processor import volcano_processor
from app.services.live.volcanoes.volcano_scraper import volcano_scraper
from app.services.live.volcanoes.volcano_updater import volcano_updater


class VolcanoScheduler:
    """Schedule volcano advisory scrapes and updates."""

    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()

    async def start_scheduler(self) -> None:
        """Start volcano advisory scheduler."""

        try:
            interval_minutes = getattr(
                settings, "VOLCANO_SCRAPE_INTERVAL_MINUTES", 60
            )

            self.scheduler.add_job(
                self.run_sync,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id="volcano_sync",
                name=f"Sync volcano advisories every {interval_minutes} minutes",
                replace_existing=True,
            )

            # Note: Removed immediate startup job to prevent blocking the lifespan function
            # The first sync will happen after the scheduled interval

            self.scheduler.start()
            print(
                f"📅 Volcano scheduler started - syncing every {interval_minutes} minutes"
            )
        except Exception as exc:  # noqa: BLE001
            print(f"❌ Failed to start volcano scheduler: {exc}")

    async def stop_scheduler(self) -> None:
        """Stop volcano scheduler if running."""

        if self.scheduler.running:
            self.scheduler.shutdown()
            print("📅 Volcano scheduler stopped")

    async def run_sync(self) -> None:
        """Execute volcano advisory synchronization workflow with retry."""

        try:
            print(f"\n🌋 Starting volcano sync job at {datetime.now()}")
            await self._execute_sync_job()
        except Exception as exc:  # noqa: BLE001
            print(f"💥 Volcano sync job crashed: {exc}")
            print("🔄 Retrying in 30 seconds...")

            try:
                await asyncio.sleep(30)
                await self._execute_sync_job()
                print("✅ Volcano retry successful!")
            except Exception as retry_error:  # noqa: BLE001
                print(f"💥 Volcano retry also failed: {retry_error}")
                print("❌ Giving up until next scheduled run.")

    async def _execute_sync_job(self) -> None:
        """Full volcano advisory workflow: scrape → process → update."""

        # Step 1: Scrape volcano advisory data from PHIVOLCS
        start_time = time.time()
        raw_advisories = await volcano_scraper.scrape_latest_advisories()
        end_time = time.time()
        print(f"[1: Scrape Volcano] Execution time: {end_time - start_time:.6f} seconds")

        # Step 2: Process and transform raw volcano advisory data
        start_time = time.time()
        processed_advisories = await volcano_processor.process_advisories(raw_advisories)
        end_time = time.time()
        print(f"[2: Process Volcano] Execution time: {end_time - start_time:.6f} seconds")

        # Step 3: Compare processed volcano advisory data with database
        start_time = time.time()
        advisories_to_update = await volcano_comparator.select_latest(processed_advisories)
        end_time = time.time()
        print(f"[3: Compare Volcano] Execution time: {end_time - start_time:.6f} seconds")

        # Step 4: Update volcano advisory data in database
        start_time = time.time()
        success = await volcano_updater.apply_updates(advisories_to_update)
        end_time = time.time()
        print(f"[4: Update Volcano] Execution time: {end_time - start_time:.6f} seconds")

        if success:
            print(f"✅ Volcano sync job completed successfully at {datetime.now()}\n")
        else:
            print(f"❌ Volcano sync job failed at {datetime.now()}\n")


volcano_scheduler = VolcanoScheduler()
