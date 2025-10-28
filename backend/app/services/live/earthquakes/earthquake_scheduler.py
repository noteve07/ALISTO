# app/services/scheduler.py
import asyncio
import time
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.services.live.earthquakes.earthquake_comparator import earthquake_comparator
from app.services.live.earthquakes.earthquake_processor import earthquake_processor
from app.services.live.earthquakes.earthquake_scraper import earthquake_scraper
from app.services.live.earthquakes.earthquake_updater import earthquake_updater


class EarthquakeScheduler:
    """ 
    Service for scraping earthquake data from PHIVOLCS 
    and updating the earthquake table in real-time
    """
    def __init__(self):
        self.base_url = settings.phivolcs_url
        self.timeout = settings.request_timeout
        self.scheduler = AsyncIOScheduler()


    async def start_scheduler(self):
        """Start the background scheduler"""
        try:
            # get interval from settings (default 3 minutes)
            interval_minutes = getattr(settings, 'SCRAPE_INTERVAL_MINUTES', 3)
            
            # add scheduled job
            self.scheduler.add_job(
                self.earthquake_sync_job,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id='earthquake_sync',
                name=f'Sync earthquakes every {interval_minutes} minutes',
                replace_existing=True
            )
            
            # Note: Removed immediate startup job to prevent blocking the lifespan function
            # The first sync will happen after the scheduled interval
            
            self.scheduler.start()
            print(f"📅 Earthquake scheduler started - syncing every {interval_minutes} minutes")
            
        except Exception as e:
            print(f"❌ Failed to start scheduler: {e}")
    

    async def stop_scheduler(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("📅 Earthquake scheduler stopped")



    async def earthquake_sync_job(self, retry_count: int = 0):
        """
        Main scheduled job with automatic retry capability.
        Handles temporary failures by retrying once after 15 seconds.
        """

        try:
            print(f"\n🚀 Starting earthquake sync job at {datetime.now()}")
            await self._execute_sync_job()
                
        except Exception as e:
            print(f"💥 Sync job crashed: {e}")
            print("🔄 Retrying in 15 seconds...")
            
            try:
                await asyncio.sleep(15)
                await self._execute_sync_job()
                print("✅ Retry successful!")
            except Exception as retry_error:
                print(f"💥 Retry also failed: {retry_error}")
                print("❌ Giving up until next scheduled run.")

        

    async def _execute_sync_job(self):
        """
        Execute the earthquake synchronization workflow:
        Scrape → Process → Check → Add/Skip
        """

        # Step 1: Scrape earthquake data from PHIVOLCS
        start_time = time.time()
        scraped_earthquakes = await earthquake_scraper.scrape_latest_earthquakes(None)
        end_time = time.time()
        print(f"[1: Scrape] Execution time: {end_time - start_time:.6f} seconds")

        # Step 2: Process and transform raw earthquake data
        start_time = time.time()
        processed_earthquakes = await earthquake_processor.process_earthquakes(
            scraped_earthquakes
        )
        end_time = time.time()
        print(f"[2: Process] Execution time: {end_time - start_time:.6f} seconds")

        # Step 3: Check for new earthquakes not in database
        start_time = time.time()
        new_earthquakes = await earthquake_comparator.check_for_new_earthquakes(
            processed_earthquakes
        )
        end_time = time.time()
        print(f"[3: Check] Execution time: {end_time - start_time:.6f} seconds")
        
        # Step 4: Add new earthquakes to database or skip if none
        start_time = time.time()
        success = await earthquake_updater.add_or_skip_earthquakes(new_earthquakes)
        end_time = time.time()
        print(f"[4: Add/Skip] Execution time: {end_time - start_time:.6f} seconds")
        
        if success:
            print(f"✅ Sync job completed successfully at {datetime.now()}\n")
        else:
            print(f"❌ Sync job failed at {datetime.now()}\n")

    


# Global scheduler instance
earthquake_scheduler = EarthquakeScheduler()