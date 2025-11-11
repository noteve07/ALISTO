import logging
from datetime import datetime
from typing import Dict, List
import json
import os
from pathlib import Path
from .province_feature_service import ProvinceFeatureService
from .risk_prediction_service import RiskPredictionService
from app.core.database import supabase

logger = logging.getLogger(__name__)

class RiskAssessmentService:
    """Main orchestrator service for earthquake risk assessment"""
    
    def __init__(self):
        """Initialize the risk assessment service with required components"""
        try:
            self.feature_service = ProvinceFeatureService()
            self.prediction_service = RiskPredictionService()
            self.provinces_lookup = self._load_provinces_lookup()
            logger.info("✅ RiskAssessmentService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize RiskAssessmentService: {e}")
            raise
    
    def _load_provinces_lookup(self) -> Dict[str, int]:
        """Load province name to ID mapping"""
        try:
            lookup_file_path = os.path.join(
                os.path.dirname(__file__), 
                "../../src/lookup/provinces_id.json"
            )
            with open(lookup_file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading provinces lookup: {e}")
            return {}
    
    def run_complete_risk_assessment(self) -> Dict:
        """Run complete risk assessment pipeline"""
        try:
            logger.info("🚀 Starting complete risk assessment...")
            start_time = datetime.now()
            
            # Step 1: Get province features
            logger.info("📊 Step 1: Fetching province earthquake features...")
            province_features = self.feature_service.get_all_province_features()
            
            # Step 2: Predict risk levels
            logger.info("🤖 Step 2: Predicting risk levels...")
            all_predictions = self.prediction_service.predict_risk_levels(province_features)
            
            # Step 3: Filter high-risk provinces only
            logger.info("🔥 Step 3: Filtering high-risk provinces...")
            high_risk_provinces = [
                pred for pred in all_predictions 
                if pred['predicted_risk_level'] == 'High'
            ]
            
            # Calculate summary statistics
            total_provinces = len(all_predictions)
            high_risk_count = len(high_risk_provinces)
            low_risk_count = total_provinces - high_risk_count
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            # Log results
            logger.info(f"✅ Risk assessment completed in {processing_time:.2f} seconds")
            logger.info(f"📈 Summary: {high_risk_count} high-risk, {low_risk_count} low-risk out of {total_provinces} provinces")
            
            if high_risk_provinces:
                logger.info("🚨 HIGH RISK PROVINCES DETECTED:")
                for province in high_risk_provinces:
                    features = province['earthquake_features']
                    logger.info(
                        f"   🔴 {province['province_name']} (ID: {province['province_id']}) - "
                        f"Probability: {province['risk_probability']:.3f}, "
                        f"EQ Count (30d): {features['eq_count_last_30d']}, "
                        f"Max Magnitude: {features['max_magnitude_last_30d']:.1f}, "
                        f"Days since last EQ: {features['days_since_last_eq']}"
                    )
            else:
                logger.info("✅ No high-risk provinces detected")
            
            return {
                'success': True,
                'timestamp': end_time.isoformat(),
                'processing_time_seconds': processing_time,
                'summary': {
                    'total_provinces': total_provinces,
                    'high_risk_count': high_risk_count,
                    'low_risk_count': low_risk_count,
                    'high_risk_percentage': (high_risk_count / total_provinces * 100) if total_provinces > 0 else 0
                },
                'high_risk_provinces': high_risk_provinces,
                'all_predictions': all_predictions  # Include all for debugging
            }
            
        except Exception as e:
            logger.error(f"❌ Risk assessment failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_high_risk_provinces_for_update(self) -> List[Dict]:
        """Get only high-risk provinces formatted for database update"""
        try:
            result = self.run_complete_risk_assessment()
            
            if not result['success']:
                raise Exception(f"Risk assessment failed: {result.get('error', 'Unknown error')}")
            
            high_risk_provinces = result['high_risk_provinces']
            
            # Format for database update
            update_data = []
            for province in high_risk_provinces:
                update_data.append({
                    'province_id': province['province_id'],
                    'province_name': province['province_name'],
                    'risk_level': 'High',
                    'risk_probability': province['risk_probability'],
                    'calculated_at': datetime.now().isoformat(),
                    'features_summary': province['earthquake_features']
                })
            
            logger.info(f"✅ Prepared {len(update_data)} provinces for risk level update")
            return update_data
            
        except Exception as e:
            logger.error(f"Error preparing high-risk provinces for update: {e}")
            raise
    
    def update_high_risk_provinces_in_database(self) -> Dict:
        """Update only high-risk provinces in the database (keeps console prints)"""
        try:
            logger.info("🔄 Starting high-risk provinces database update...")
            
            # Get high-risk provinces
            high_risk_data = self.get_high_risk_provinces_for_update()
            
            if not high_risk_data:
                logger.info("✅ No high-risk provinces to update in database")
                print("📊 DATABASE UPDATE: No high-risk provinces found")
                return {
                    'success': True,
                    'updated_provinces': 0,
                    'message': 'No high-risk provinces to update'
                }
            
            # Update database for each high-risk province
            updated_count = 0
            failed_updates = []
            
            print(f"\n📊 UPDATING {len(high_risk_data)} HIGH-RISK PROVINCES IN DATABASE:")
            print("=" * 70)
            
            for province_data in high_risk_data:
                try:
                    # Prepare record for upsert
                    record = {
                        "province_id": province_data['province_id'],
                        "risk_level": province_data['risk_level'],
                        "calculated_at": province_data['calculated_at']
                    }
                    
                    # Upsert into risk_evaluations table
                    response = supabase.table("risk_evaluations").upsert(
                        record, 
                        on_conflict="province_id"
                    ).execute()
                    
                    if response.data:
                        updated_count += 1
                        print(f"✅ {province_data['province_name']:25} | Risk: {province_data['risk_level']:4} | Prob: {province_data['risk_probability']:.3f}")
                        logger.info(f"Updated province_id {province_data['province_id']} ({province_data['province_name']}) to {province_data['risk_level']} risk")
                    else:
                        failed_updates.append(province_data['province_name'])
                        print(f"❌ {province_data['province_name']:25} | Failed to update")
                        
                except Exception as e:
                    failed_updates.append(province_data['province_name'])
                    print(f"❌ {province_data['province_name']:25} | Error: {str(e)}")
                    logger.error(f"Failed to update province {province_data['province_name']}: {e}")
            
            print("=" * 70)
            print(f"📈 SUMMARY: {updated_count}/{len(high_risk_data)} provinces updated successfully")
            
            if failed_updates:
                print(f"⚠️  Failed updates: {', '.join(failed_updates)}")
            
            logger.info(f"✅ Database update completed: {updated_count} high-risk provinces updated")
            
            return {
                'success': True,
                'updated_provinces': updated_count,
                'failed_provinces': failed_updates,
                'total_high_risk': len(high_risk_data)
            }
            
        except Exception as e:
            logger.error(f"❌ Database update failed: {e}")
            print(f"❌ DATABASE UPDATE FAILED: {e}")
            return {
                'success': False,
                'error': str(e),
                'updated_provinces': 0
            }
    
    def validate_services_health(self) -> Dict:
        """Validate that all services are working properly"""
        try:
            logger.info("🔍 Validating services health...")
            
            # Test model health
            model_health = self.prediction_service.validate_model_health()
            
            # Test database connection (feature service)
            try:
                provinces = self.feature_service.get_all_provinces()
                db_health = {
                    'status': 'healthy',
                    'provinces_count': len(provinces)
                }
            except Exception as e:
                db_health = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
            
            overall_status = 'healthy' if (
                model_health.get('status') == 'healthy' and 
                db_health.get('status') == 'healthy'
            ) else 'unhealthy'
            
            return {
                'overall_status': overall_status,
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'prediction_model': model_health,
                    'database_connection': db_health,
                    'feature_service': {'status': 'healthy'},
                }
            }
            
        except Exception as e:
            logger.error(f"Health validation failed: {e}")
            return {
                'overall_status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }