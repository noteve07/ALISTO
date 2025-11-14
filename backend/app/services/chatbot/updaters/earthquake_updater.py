"""Earthquake context updater service"""
from datetime import datetime, timedelta
import json
import os
from statistics import mean
from pathlib import Path

from app.core.database import supabase


class EarthquakeContextUpdater:
    def __init__(self):
        self.context_dir = Path(__file__).parent.parent / "context"
        self.provinces_lookup = self._load_provinces_lookup()
        self.province_id_to_name = {v: k for k, v in self.provinces_lookup.items()}
    
    def _load_provinces_lookup(self):
        """Load province lookup data"""
        try:
            lookup_file_path = os.path.join(
                os.path.dirname(__file__), 
                "../../../src/lookup/provinces_id.json"
            )
            with open(lookup_file_path, 'r') as f:
                data = json.load(f)
                return data
        except Exception as e:
            print(f"Error loading provinces lookup: {e}")
            return {}
    
    async def update_earthquake_context(self, hours: int = 24):
        """Update earthquake context and write to earthquakes.txt"""
        try:
            # Calculate time window
            now = datetime.now()
            start_time = now - timedelta(hours=hours)
            start_iso = start_time.isoformat()

            # Query earthquakes from database
            query = (
                supabase.table("earthquakes")
                .select("datetime, magnitude, depth, province_id, location")
                .gte("datetime", start_iso)
                .order("datetime", desc=True)
            )

            result = query.execute()
            earthquakes = result.data if result.data else []

            # Process earthquake data with proper province lookup
            major_earthquakes_text = []
            minor_count = 0  # magnitude < 3.0
            major_count = 0  # magnitude >= 3.0
            
            for eq in earthquakes:
                magnitude = eq.get('magnitude', 0)
                province_id = eq.get('province_id')
                
                # Find province name by ID (case-insensitive lookup)
                province_name = "Unknown"
                if province_id:
                    province_name = self.province_id_to_name.get(province_id, "Unknown")
                    if province_name != "Unknown":
                        province_name = province_name.title()
                
                if magnitude < 3.0:
                    minor_count += 1
                else:
                    major_count += 1
                    # Only include major earthquakes in detailed list
                    datetime_str = eq.get('datetime', '')
                    depth = eq.get('depth', 0)
                    major_earthquakes_text.append(f"{datetime_str} | {magnitude} | {depth}km | {province_name}")

            # Calculate statistics
            magnitudes = [float(eq.get('magnitude', 0)) for eq in earthquakes if eq.get('magnitude')]
            count = len(earthquakes)
            average_magnitude = round(mean(magnitudes), 2) if magnitudes else 0
            highest_magnitude = max(magnitudes) if magnitudes else 0

            # Build text format context
            context_text = f"""EARTHQUAKE SUMMARY (Last {hours} hours):
Total: {count} | Minor (<3.0): {minor_count} | Major (>=3.0): {major_count}
Average Magnitude: {average_magnitude} | Highest: {highest_magnitude}
Updated: {now.strftime('%Y-%m-%d %H:%M:%S')}

MAJOR EARTHQUAKES (>=3.0):
DateTime | Magnitude | Depth | Province
{'=' * 50}
{chr(10).join(major_earthquakes_text) if major_earthquakes_text else 'No major earthquakes in this period'}"""

            # Write to earthquakes.txt as text format
            earthquakes_file = self.context_dir / "earthquakes.txt"
            with open(earthquakes_file, 'w', encoding='utf-8') as f:
                f.write(context_text)
            
            print(f"Earthquake context updated at {now}")
            return True
            
        except Exception as e:
            print(f"Error updating earthquake context: {e}")
            return False


# Global instance
earthquake_context_updater = EarthquakeContextUpdater()