# app/services/scheduler.py
import re
import time
import hashlib
import asyncio
from datetime import datetime
from typing import List, Dict, Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.services.live.earthquake.earthquake_scraper import scraper_service
from app.models.earthquake import EarthquakeRawData
from app.models.earthquake import EarthquakeData
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
        scraped_earthquakes = await scraper_service.scrape_latest_earthquakes(100)
        end_time = time.time()
        print(f"[1: Scrape] Execution time: {end_time - start_time:.6f} seconds")

        # Step 2: Process and transform raw earthquake data
        start_time = time.time()
        processed_earthquakes = await self.process_earthquakes(scraped_earthquakes)
        end_time = time.time()
        print(f"[2: Process] Execution time: {end_time - start_time:.6f} seconds")

        # Step 3: Check for new earthquakes not in database
        start_time = time.time()
        new_earthquakes = await self.check_for_new_earthquakes(processed_earthquakes)
        end_time = time.time()
        print(f"[3: Check] Execution time: {end_time - start_time:.6f} seconds")
        
        # Step 4: Add new earthquakes to database or skip if none
        start_time = time.time()
        success = await self.add_or_skip_earthquakes(new_earthquakes)
        end_time = time.time()
        print(f"[4: Add/Skip] Execution time: {end_time - start_time:.6f} seconds")
        
        if success:
            print(f"✅ Sync job completed successfully at {datetime.now()}\n")
        else:
            print(f"❌ Sync job failed at {datetime.now()}\n")



    async def process_earthquakes(self, raw_earthquakes: List[EarthquakeRawData]) -> List[EarthquakeData]:
        """
        Process earthquake row data for datetime, eq_id and province_id
        """
        try:
            print(f"🔄 Processing earthquakes data...")

            seen_eq_ids = set()
            processed_earthquake_row = []
            for eq in raw_earthquakes:
                # convert datetime to ISO format
                datetime_iso = self.parse_datetime_string(eq.datetime)
                if datetime_iso is None:
                    print(f"⚠️ Skipping earthquake due to invalid datetime: {eq.datetime}")
                    return None

                # extract the province from location
                province_name = await self.extract_province(eq.location)

                # get the province_id from the province name
                province_id = await self.get_province_id(province_name)

                # compile all changes in a dictionary
                eq_dict = {
                    # Ensure datetime is an ISO string for DB insertion
                    "datetime": datetime_iso,
                    "latitude": eq.latitude,
                    "longitude": eq.longitude,
                    "coordinates": "SRID=4326;POINT(120.984222 14.599512)",
                    "depth": eq.depth,
                    "magnitude": eq.magnitude,
                    "location": eq.location,
                    "province_id": province_id,
                }

                # generate the eq_id using hashing
                eq_id = await self.generate_eq_hash(eq_dict)


                # check if duplicate
                if eq_id in seen_eq_ids:
                    continue

                seen_eq_ids.add(eq_id)
                eq_dict["eq_id"] = eq_id
                processed_earthquake_row.append(eq_dict)


            print(f"✅ Processed {len(processed_earthquake_row)} earthquakes with hashes")
            return processed_earthquake_row
            
        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return []
        
    

    def parse_datetime_string(self, date_string: str) -> str | None:
        """
        Parse PHIVOLCS datetime string to ISO format string
        Format: "25 October 2025 - 07:29 PM" → "2025-10-25T19:29:00"
        """
        try:
            # handle the format with " - " separator
            if ' - ' in date_string:
                date_part, time_part = date_string.split(' - ')
                dt_format = "%d %B %Y %I:%M %p"
                dt_obj = datetime.strptime(f"{date_part} {time_part}", dt_format)
                return dt_obj.isoformat()
            else:
                # try other possible formats
                dt_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
                return dt_obj.isoformat()
        except Exception as e:
            print(f"❌ Failed to parse datetime: {date_string}, error: {e}")
            return None
    
    

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
        Look up province id from province name using local provinces_id.json. Returns None if not found.
        """
        if not province_name:
            return None
        try:
            import json
            import os
            # load provinces_id.json once and cache it
            if not hasattr(self, '_province_id_map'):
                json_path = os.path.join(os.path.dirname(__file__), '../src/provinces_id.json')
                with open(json_path, 'r', encoding='utf-8') as f:
                    self._province_id_map = json.load(f)
            # normalize province name for lookup
            key = province_name.strip().lower()
            return self._province_id_map.get(key, None)
        except Exception as e:
            print(f"❌ Province lookup failed for {province_name}: {e}")
            return None



    async def generate_eq_hash(self, earthquake: Dict[str, Any]) -> str:
        """
        Generate unique hash for earthquake using timestamp + magnitude + province
        """
        # extract values for hash
        timestamp = str(earthquake.get('datetime', ''))
        magnitude = str(earthquake.get('magnitude', ''))
        location = str(earthquake.get('location', ''))
        
        # create combined string
        combined = f"{timestamp}_{magnitude}_{location}"
        
        # generate MD5 hash
        eq_hash = hashlib.md5(combined.encode()).hexdigest()
        return eq_hash
    


    async def check_for_new_earthquakes(self, scraped_earthquakes: List[EarthquakeData]) -> List[EarthquakeData]:
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
            # add new earthquakes to database
            result = supabase.table('latest_earthquakes')\
                .insert(new_earthquakes)\
                .execute()
            
            print(f"✅ Successfully added {len(result.data)} new earthquakes to database")
            
            # clean up old records (keep only last 10000)
            await self.cleanup_old_records()
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to add earthquakes to database: {e}")
            return False
        
    

    async def cleanup_old_records(self, keep_count: int = 10_000):
        """
        Keep only the most recent earthquakes in database
        """
        try:
            # get total count
            count_result = supabase.table('latest_earthquakes')\
                .select("*", count='exact')\
                .execute()
            
            total_count = count_result.count
            
            if total_count > keep_count:
                # get IDs of old records to delete
                old_records = supabase.table('latest_earthquakes')\
                    .select("id")\
                    .order('datetime', desc=False)\
                    .limit(total_count - keep_count)\
                    .execute()
                
                if old_records.data:
                    old_ids = [record['id'] for record in old_records.data]
                    
                    # delete old records
                    supabase.table('latest_earthquakes')\
                        .delete()\
                        .in_('id', old_ids)\
                        .execute()
                    
                    print(f"🧹 Cleaned up {len(old_ids)} old earthquake records")
            
        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")

    


# Global scheduler instance
earthquake_scheduler = EarthquakeScheduler()