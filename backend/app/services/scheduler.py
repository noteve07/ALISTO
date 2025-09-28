# app/services/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import hashlib
import logging
from typing import List, Dict, Any

from app.services.earthquake_scraper import scraper_service
from app.core.database import supabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class EarthquakeScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
    
    def generate_eq_hash(self, earthquake: Dict[str, Any]) -> str:
        """
        Generate unique hash for earthquake using timestamp + magnitude + province
        """
        # Extract values for hash
        timestamp = str(earthquake.get('date_time', ''))
        magnitude = str(earthquake.get('magnitude', ''))
        province = str(earthquake.get('province', ''))
        
        # Create combined string
        combined = f"{timestamp}_{magnitude}_{province}"
        
        # Generate MD5 hash
        eq_hash = hashlib.md5(combined.encode()).hexdigest()
        return eq_hash
    
    async def scrape_earthquakes(self) -> List[Dict[str, Any]]:
        """
        Scrape latest earthquakes and add eq_hash to each
        """
        try:
            print(f"🔄 Scraping earthquakes at {datetime.now()}")
            
            # Scrape from PHIVOLCS
            raw_earthquakes = await scraper_service.scrape_latest_earthquakes(50)
            
            # Convert to dict and add eq_hash
            earthquakes_with_hash = []
            for eq in raw_earthquakes:
                eq_dict = {
                    "date_time": eq.date_time,
                    "latitude": eq.latitude,
                    "longitude": eq.longitude,
                    "depth": eq.depth,
                    "magnitude": eq.magnitude,
                    "location": eq.location,
                    "province": eq.province
                }
                
                # Add eq_hash
                eq_dict["eq_hash"] = self.generate_eq_hash(eq_dict)
                earthquakes_with_hash.append(eq_dict)
            
            print(f"✅ Scraped {len(earthquakes_with_hash)} earthquakes with hashes")
            return earthquakes_with_hash
            
        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return []
    
    async def check_for_new_earthquakes(self, scraped_earthquakes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Check which earthquakes are new by comparing eq_hash with database
        Returns list of new earthquakes to add
        """
        if not scraped_earthquakes:
            return []
        
        try:
            # Get top earthquake from database (most recent)
            db_result = supabase.table('latest_earthquakes')\
                .select("eq_hash")\
                .order('date_time', desc=True)\
                .limit(1)\
                .execute()
            
            # If database is empty, all scraped earthquakes are new
            if not db_result.data:
                print("📝 Database is empty - all earthquakes are new")
                return scraped_earthquakes
            
            db_top_hash = db_result.data[0]['eq_hash']
            scraped_top_hash = scraped_earthquakes[0]['eq_hash']
            
            # If top hashes match, no new earthquakes
            if db_top_hash == scraped_top_hash:
                print("✅ No new earthquakes found")
                return []
            
            # Find new earthquakes by comparing until we find a match
            new_earthquakes = []
            for earthquake in scraped_earthquakes:
                # Check if this earthquake hash exists in database
                existing = supabase.table('latest_earthquakes')\
                    .select("eq_hash")\
                    .eq('eq_hash', earthquake['eq_hash'])\
                    .execute()
                
                # If not found in database, it's new
                if not existing.data:
                    new_earthquakes.append(earthquake)
                else:
                    # Found existing earthquake, stop checking
                    break
            
            print(f"🆕 Found {len(new_earthquakes)} new earthquakes")
            return new_earthquakes
            
        except Exception as e:
            print(f"❌ Error checking for new earthquakes: {e}")
            return []
    
    async def add_or_skip_earthquakes(self, new_earthquakes: List[Dict[str, Any]]) -> bool:
        """
        Add new earthquakes to database or skip if none
        """
        if not new_earthquakes:
            print("⏭️ No new earthquakes to add - skipping")
            return True
        
        try:
            # Add new earthquakes to database
            result = supabase.table('latest_earthquakes')\
                .insert(new_earthquakes)\
                .execute()
            
            print(f"✅ Successfully added {len(result.data)} new earthquakes to database")
            
            # Optional: Clean up old records (keep only last 1000)
            await self.cleanup_old_records()
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to add earthquakes to database: {e}")
            return False
    
    async def cleanup_old_records(self, keep_count: int = 1000):
        """
        Keep only the most recent earthquakes in database
        """
        try:
            # Get total count
            count_result = supabase.table('latest_earthquakes')\
                .select("*", count='exact')\
                .execute()
            
            total_count = count_result.count
            
            if total_count > keep_count:
                # Get IDs of old records to delete
                old_records = supabase.table('latest_earthquakes')\
                    .select("id")\
                    .order('date_time', desc=False)\
                    .limit(total_count - keep_count)\
                    .execute()
                
                if old_records.data:
                    old_ids = [record['id'] for record in old_records.data]
                    
                    # Delete old records
                    supabase.table('latest_earthquakes')\
                        .delete()\
                        .in_('id', old_ids)\
                        .execute()
                    
                    print(f"🧹 Cleaned up {len(old_ids)} old earthquake records")
            
        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")
    
    async def earthquake_sync_job(self):
        """
        Main scheduled job: Scrape -> Check -> Add/Skip
        """
        try:
            print(f"\n🚀 Starting earthquake sync job at {datetime.now()}")
            
            # Step 1: Scrape
            scraped_earthquakes = await self.scrape_earthquakes()
            
            # Step 2: Check for new ones
            new_earthquakes = await self.check_for_new_earthquakes(scraped_earthquakes)
            
            # Step 3: Add or Skip
            success = await self.add_or_skip_earthquakes(new_earthquakes)
            
            if success:
                print(f"✅ Sync job completed successfully at {datetime.now()}\n")
            else:
                print(f"❌ Sync job failed at {datetime.now()}\n")
                
        except Exception as e:
            print(f"💥 Sync job crashed: {e}\n")
    
    async def start_scheduler(self):
        """Start the background scheduler"""
        try:
            # Get interval from settings (default 3 minutes)
            interval_minutes = getattr(settings, 'SCRAPE_INTERVAL_MINUTES', 3)
            
            # Add scheduled job
            self.scheduler.add_job(
                self.earthquake_sync_job,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id='earthquake_sync',
                name=f'Sync earthquakes every {interval_minutes} minutes',
                replace_existing=True
            )
            
            # Run immediately on startup
            self.scheduler.add_job(
                self.earthquake_sync_job,
                trigger='date',
                run_date=datetime.now(),
                id='earthquake_sync_startup'
            )
            
            self.scheduler.start()
            print(f"📅 Earthquake scheduler started - syncing every {interval_minutes} minutes")
            
        except Exception as e:
            print(f"❌ Failed to start scheduler: {e}")
    
    async def stop_scheduler(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("📅 Earthquake scheduler stopped")

# Global scheduler instance
earthquake_scheduler = EarthquakeScheduler()