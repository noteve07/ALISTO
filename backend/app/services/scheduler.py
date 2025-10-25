# app/services/scheduler.py
import re
import time
import hashlib
from datetime import datetime
from typing import List, Dict, Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.services.earthquake_scraper import scraper_service
from app.core.database import supabase
from app.core.config import settings


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
            
            # run immediately on startup
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


    async def earthquake_sync_job(self):
        """
        Main scheduled job: Scrape -> Check -> Add/Skip
        """
        try:
            print(f"\n🚀 Starting earthquake sync job at {datetime.now()}")
            
            
            # Step 1: Scrape earthquake data
            start_time = time.time()
            scraped_earthquakes = await self.scrape_earthquakes()
            end_time = time.time()
            print(f"[1: Scrape] Execution time: {end_time - start_time:.6f} seconds")

            # Step 2: Check for new ones
            start_time = time.time()
            new_earthquakes = await self.check_for_new_earthquakes(scraped_earthquakes)
            end_time = time.time()
            print(f"[2: Check] Execution time: {end_time - start_time:.6f} seconds")
            
            # Step 3: Add to database or Skip
            start_time = time.time()
            success = await self.add_or_skip_earthquakes(new_earthquakes)
            end_time = time.time()
            print(f"[3: Add/Skip] Execution time: {end_time - start_time:.6f} seconds")
            
            if success:
                print(f"✅ Sync job completed successfully at {datetime.now()}\n")
            else:
                print(f"❌ Sync job failed at {datetime.now()}\n")
                
        except Exception as e:
            print(f"💥 Sync job crashed: {e}\n")

        
    async def scrape_earthquakes(self) -> List[Dict[str, Any]]:
        """
        Process earthquake row data for eq_id, province 
        """
        try:
            print(f"🔄 Scraping earthquakes at {datetime.now()}")
            
            # call the earthquake_scraper.py service
            raw_earthquakes = await scraper_service.scrape_latest_earthquakes(50)  
            
            start_time = time.time()
            # convert to dict and add eq_hash
            earthquakes_with_hash = []
            for eq in raw_earthquakes:
                eq_dict = {
                    "datetime": eq.datetime,
                    "latitude": eq.latitude,
                    "longitude": eq.longitude,
                    "depth": eq.depth,
                    "magnitude": eq.magnitude,
                    "location": eq.location,
                }

                # extract the province from location
                province_name = await self.extract_province(eq_dict["location"])

                # get the province_id from the province name
                eq_dict["province_id"] = await self.get_province_id(province_name)
                
                # get the eq_id using hashing
                eq_dict["eq_id"] = await self.generate_eq_hash(eq_dict)

                

                earthquakes_with_hash.append(eq_dict)


            end_time = time.time()
            print(f"[1: Scrape (Hash/Province)] Execution time: {end_time - start_time:.6f} seconds")
            

            print(f"✅ Scraped {len(earthquakes_with_hash)} earthquakes with hashes")
            return earthquakes_with_hash
            
        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return []
    

    async def generate_eq_hash(self, earthquake: Dict[str, Any]) -> str:
        """
        Generate unique hash for earthquake using timestamp + magnitude + province
        """
        # Extract values for hash
        timestamp = str(earthquake.get('datetime', ''))
        magnitude = str(earthquake.get('magnitude', ''))
        location = str(earthquake.get('location', ''))
        
        # Create combined string
        combined = f"{timestamp}_{magnitude}_{location}"
        
        # Generate MD5 hash
        eq_hash = hashlib.md5(combined.encode()).hexdigest()
        return eq_hash
    
    
    async def extract_province(self, location: str) -> str:
        """
        Extract province name from location for each earthquake data
        """
        matches = re.findall(r'\(([^)]+)\)', str(location))
        if len(matches) == 0:
            return ""
        elif len(matches) == 1:
            return matches[0]
        else:
            return matches[-1]
        

    async def get_province_id(self, province_name: str) -> int:
        """
        Look up province id from province name. Returns None if not found.
        """
        if not province_name:
            return None
        
        try:
            result = supabase.table('provinces')\
                .select('province_id')\
                .ilike('name', f'%{province_name}%')\
                .execute()
            
            return result.data[0]['province_id'] if result.data else None
        except Exception as e:
            print(f"❌ Province lookup failed for {province_name}: {e}")        
            return None

    
    async def check_for_new_earthquakes(self, scraped_earthquakes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Check which earthquakes are new by comparing eq_hash with database
        Returns list of new earthquakes to add
        """ 
        if not scraped_earthquakes:
            return []
        
        try:
            # get top earthquake from database (most recent)
            db_result = supabase.table('latest_earthquakes')\
                .select("eq_id")\
                .order('datetime', desc=True)\
                .limit(1)\
                .execute()
            
            # ff database is empty, all scraped earthquakes are new
            if not db_result.data:
                print("📝 Database is empty - all earthquakes are new")
                return scraped_earthquakes
            
            # compare the top eq_id from the database and scraped data
            db_top_id = db_result.data[0]['eq_id']
            scraped_top_id = scraped_earthquakes[0]['eq_id']
            
            # if top eq_ids match, no new earthquakes
            if db_top_id == scraped_top_id:
                print("✅ No new earthquakes found")
                return []
            
            # find new earthquakes by comparing until we find a match
            new_earthquakes = []
            for earthquake in scraped_earthquakes:
                # check if this earthquake hash exists in database
                existing = supabase.table('latest_earthquakes')\
                    .select('eq_id')\
                    .eq('eq_id', earthquake['eq_id'])\
                    .execute()
                
                # if not found in database, it's new
                if not existing.data:
                    new_earthquakes.append(earthquake)
                else:
                    # found existing earthquake, stop checking
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
                    .order('datetime', desc=False)\
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

    


# Global scheduler instance
earthquake_scheduler = EarthquakeScheduler()