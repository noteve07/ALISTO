"""Volcanic advisories context updater service"""
from datetime import datetime
import json
import os
from pathlib import Path

from app.core.database import supabase


class VolcanicAdvisoriesContextUpdater:
    def __init__(self):
        self.context_dir = Path(__file__).parent.parent / "context"
        self.volcanoes_lookup = self._load_volcanoes_lookup()
        self.volcano_id_to_name = {v["id"]: v["name"] for v in self.volcanoes_lookup}
    
    def _load_volcanoes_lookup(self):
        """Load volcanoes lookup data"""
        try:
            lookup_file_path = os.path.join(
                os.path.dirname(__file__), 
                "../../../src/lookup/volcanoes_id.json"
            )
            with open(lookup_file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading volcanoes lookup: {e}")
            return []
    
    async def update_volcanic_advisories_context(self):
        """Update volcanic advisories context and write to volcanic_advisories.txt"""
        try:
            # Query volcanic advisories from database
            query = (
                supabase.table("volcanic_advisories")
                .select("volcano_id, alert_level, alert_status, issuance_date, updated_at")
                .order("alert_level", desc=True)
            )

            result = query.execute()
            advisories = result.data if result.data else []

            # Process advisory data into text format
            advisory_lines = []
            for adv in advisories:
                volcano_name = self.volcano_id_to_name.get(adv.get('volcano_id'), 'Unknown Volcano')
                alert_level = adv.get('alert_level', 0)
                alert_status = adv.get('alert_status', 'Unknown')
                advisory_lines.append(f"{volcano_name} | Level {alert_level} | {alert_status}")

            # Calculate statistics
            total_volcanoes = len(advisories)
            active_advisories = [adv for adv in advisories if adv.get('alert_level', 0) > 0]
            active_alerts = len(active_advisories)
            normal_status = total_volcanoes - active_alerts
            highest_alert = max([adv.get('alert_level', 0) for adv in advisories]) if advisories else 0

            # Build text format context
            now = datetime.now()
            context_text = f"""VOLCANIC ADVISORY SUMMARY:
Total Monitored: {total_volcanoes} | Active Alerts: {active_alerts} | Normal: {normal_status}
Highest Alert Level: {highest_alert}
Updated: {now.strftime('%Y-%m-%d %H:%M:%S')}

VOLCANIC ADVISORIES:
Volcano | Alert Level | Status
{'=' * 40}
{chr(10).join(advisory_lines) if advisory_lines else 'No volcanic advisories available'}"""

            # Write to volcanic_advisories.txt as text format
            advisories_file = self.context_dir / "volcanic_advisories.txt"
            with open(advisories_file, 'w', encoding='utf-8') as f:
                f.write(context_text)
            
            print(f"Volcanic advisories context updated at {datetime.now()}")
            return True
            
        except Exception as e:
            print(f"Error updating volcanic advisories context: {e}")
            return False


# Global instance
volcanic_advisories_context_updater = VolcanicAdvisoriesContextUpdater()