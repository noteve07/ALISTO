"""Risk evaluation context updater service"""
from datetime import datetime
import json
import os
from pathlib import Path

from app.core.database import supabase


class RiskEvaluationContextUpdater:
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
                return json.load(f)
        except Exception as e:
            print(f"Error loading provinces lookup: {e}")
            return {}
    
    async def update_risk_evaluation_context(self):
        """Update risk evaluation context and write to risk_evaluation.txt"""
        try:
            # Query risk evaluations from database
            query = (
                supabase.table("risk_evaluations")
                .select("province_id, base_risk_score, dynamic_risk_score, risk_level, calculated_at")
                .order("dynamic_risk_score", desc=True)
            )

            result = query.execute()
            evaluations = result.data if result.data else []

            # Process evaluation data into simple text format
            risk_lines = []
            for eval in evaluations:
                province_name = self.province_id_to_name.get(eval.get('province_id'), 'Unknown Province')
                risk_level = eval.get('risk_level', 'Unknown')
                risk_lines.append(f"{province_name.title()}: {risk_level}")

            # Calculate statistics
            total_provinces = len(evaluations)
            risk_levels = [eval.get('risk_level', 'Unknown') for eval in evaluations]
            high_risk = len([r for r in risk_levels if r and r.lower() == 'high'])
            medium_risk = len([r for r in risk_levels if r and r.lower() == 'medium'])
            low_risk = len([r for r in risk_levels if r and r.lower() == 'low'])

            # Build simple text format context
            now = datetime.now()
            context_text = f"""RISK EVALUATION SUMMARY:
Total Provinces: {total_provinces} | High Risk: {high_risk} | Medium Risk: {medium_risk} | Low Risk: {low_risk}
Updated: {now.strftime('%Y-%m-%d %H:%M:%S')}

RISK LEVELS:
{chr(10).join(risk_lines) if risk_lines else 'No risk evaluations available'}"""

            # Write to risk_evaluation.txt as text format
            risk_file = self.context_dir / "risk_evaluation.txt"
            with open(risk_file, 'w', encoding='utf-8') as f:
                f.write(context_text)
            
            print(f"Risk evaluation context updated at {datetime.now()}")
            return True
            
        except Exception as e:
            print(f"Error updating risk evaluation context: {e}")
            return False


# Global instance
risk_evaluation_context_updater = RiskEvaluationContextUpdater()