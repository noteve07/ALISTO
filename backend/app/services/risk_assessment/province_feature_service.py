import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client, Client
from typing import Dict, List, Optional
import logging
from app.core.database import supabase

# Setup logging
logger = logging.getLogger(__name__)

class ProvinceFeatureService:
    """Service to fetch and calculate earthquake features for provinces"""
    
    def __init__(self):
        """Initialize the service with database connection"""
        self.supabase = supabase
        logger.info("✅ ProvinceFeatureService initialized")
    
    def _load_province_mapping_from_db(self) -> Dict[int, str]:
        """Load province ID to name mapping from database"""
        try:
            logger.info("Fetching provinces from database...")
            
            response = self.supabase.table('provinces').select(
                'province_id, name'
            ).execute()
            
            if not response.data:
                logger.warning("No provinces found in database")
                return {}
            
            # Create id -> name mapping
            id_to_name = {province['province_id']: province['name'].title() for province in response.data}
            
            logger.info(f"✅ Successfully loaded {len(id_to_name)} provinces from database")
            return id_to_name
            
        except Exception as e:
            logger.error(f"Error loading province mapping from database: {e}")
            return {}
    
    def fetch_earthquakes_last_30_days(self) -> pd.DataFrame:
        """Fetch earthquakes from the last 30 days"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            logger.info(f"Fetching earthquakes from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            
            # Query earthquakes
            response = self.supabase.table('latest_earthquakes').select(
                '''
                eq_id,
                datetime,
                latitude,
                longitude,
                magnitude,
                depth,
                location,
                province_id
                '''
            ).gte('datetime', start_date.isoformat()).lte('datetime', end_date.isoformat()).order('datetime', desc=True).execute()
            
            if not response.data:
                logger.warning("No earthquake data found for the last 30 days")
                return pd.DataFrame()
            
            # Convert to DataFrame
            earthquakes = []
            province_mapping = self._load_province_mapping_from_db()
            
            for eq in response.data:
                province_name = province_mapping.get(eq['province_id'], f'Province_{eq["province_id"]}')
                
                earthquake_data = {
                    'eq_id': eq['eq_id'],
                    'datetime': pd.to_datetime(eq['datetime']),
                    'latitude': eq['latitude'],
                    'longitude': eq['longitude'],
                    'magnitude': eq['magnitude'],
                    'depth': eq['depth'] if eq['depth'] else 0,
                    'location': eq['location'],
                    'province_id': eq['province_id'],
                    'province_name': province_name
                }
                earthquakes.append(earthquake_data)
            
            df = pd.DataFrame(earthquakes)
            logger.info(f"✅ Fetched {len(df)} earthquakes from the last 30 days")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching earthquake data: {e}")
            raise
    
    def get_all_provinces(self) -> List[Dict]:
        """Get all provinces from database"""
        try:
            logger.info("Fetching all provinces from database...")
            
            response = self.supabase.table('provinces').select(
                'province_id, name'
            ).execute()
            
            if not response.data:
                logger.warning("No provinces found in database")
                return []
            
            provinces = []
            for province_data in response.data:
                provinces.append({
                    'province_id': province_data['province_id'],
                    'province_name': province_data['name'].title()
                })
            
            logger.info(f"✅ Loaded {len(provinces)} provinces from database")
            return provinces
            
        except Exception as e:
            logger.error(f"Error loading provinces from database: {e}")
            raise
    
    def calculate_province_features(self, province_id: int, province_name: str, earthquake_data: pd.DataFrame) -> Dict:
        """Calculate earthquake features for a specific province"""
        try:
            # Filter earthquakes for this province
            province_earthquakes = earthquake_data[earthquake_data['province_id'] == province_id].copy()
            
            # Current datetime for calculations
            now = datetime.now()
            
            # Initialize features with default values
            features = {
                'province_id': province_id,
                'province_name': province_name,
                'calculation_date': now.isoformat(),
                'eq_count_last_30d': 0,
                'max_magnitude_last_30d': 0.0,
                'avg_magnitude_last_30d': 0.0,
                'min_magnitude_last_30d': 0.0,
                'std_magnitude_last_30d': 0.0,
                'avg_depth_last_30d': 0.0,
                'max_depth_last_30d': 0.0,
                'min_depth_last_30d': 0.0,
                'days_since_last_eq': 9999,
                'days_since_last_major_eq': 9999,
                'eq_count_last_7d': 0,
                'eq_count_last_14d': 0
            }
            
            if len(province_earthquakes) == 0:
                return features
            
            # Calculate 30-day features
            features['eq_count_last_30d'] = len(province_earthquakes)
            
            # Magnitude statistics
            magnitudes = province_earthquakes['magnitude']
            features['max_magnitude_last_30d'] = float(magnitudes.max())
            features['avg_magnitude_last_30d'] = float(magnitudes.mean())
            features['min_magnitude_last_30d'] = float(magnitudes.min())
            features['std_magnitude_last_30d'] = float(magnitudes.std()) if len(magnitudes) > 1 else 0.0
            
            # Depth statistics
            depths = province_earthquakes['depth']
            features['avg_depth_last_30d'] = float(depths.mean())
            features['max_depth_last_30d'] = float(depths.max())
            features['min_depth_last_30d'] = float(depths.min())
            
            # Time-based features
            latest_eq_time = province_earthquakes['datetime'].max()
            features['days_since_last_eq'] = (now - latest_eq_time).days
            
            # Major earthquakes (magnitude >= 5.0)
            major_earthquakes = province_earthquakes[province_earthquakes['magnitude'] >= 5.0]
            if len(major_earthquakes) > 0:
                latest_major_time = major_earthquakes['datetime'].max()
                features['days_since_last_major_eq'] = (now - latest_major_time).days
            
            # Calculate 7-day and 14-day counts
            seven_days_ago = now - timedelta(days=7)
            fourteen_days_ago = now - timedelta(days=14)
            
            last_7d_earthquakes = province_earthquakes[province_earthquakes['datetime'] >= seven_days_ago]
            last_14d_earthquakes = province_earthquakes[province_earthquakes['datetime'] >= fourteen_days_ago]
            
            features['eq_count_last_7d'] = len(last_7d_earthquakes)
            features['eq_count_last_14d'] = len(last_14d_earthquakes)
            
            return features
            
        except Exception as e:
            logger.error(f"Error calculating features for {province_name}: {e}")
            # Return default features on error
            return {
                'province_id': province_id,
                'province_name': province_name,
                'calculation_date': datetime.now().isoformat(),
                'error': str(e),
                'eq_count_last_30d': 0,
                'max_magnitude_last_30d': 0.0,
                'avg_magnitude_last_30d': 0.0,
                'min_magnitude_last_30d': 0.0,
                'std_magnitude_last_30d': 0.0,
                'avg_depth_last_30d': 0.0,
                'max_depth_last_30d': 0.0,
                'min_depth_last_30d': 0.0,
                'days_since_last_eq': 9999,
                'days_since_last_major_eq': 9999,
                'eq_count_last_7d': 0,
                'eq_count_last_14d': 0
            }
    
    def get_all_province_features(self) -> List[Dict]:
        """Get earthquake features for all provinces"""
        try:
            # Fetch data
            earthquake_data = self.fetch_earthquakes_last_30_days()
            provinces = self.get_all_provinces()
            
            if len(provinces) == 0:
                raise ValueError("No provinces found in database")
            
            # Calculate features for each province
            province_features = []
            logger.info(f"Calculating features for {len(provinces)} provinces...")
            
            for province in provinces:
                features = self.calculate_province_features(
                    province['province_id'], 
                    province['province_name'], 
                    earthquake_data
                )
                province_features.append(features)
            
            logger.info(f"✅ Successfully calculated features for {len(province_features)} provinces")
            return province_features
            
        except Exception as e:
            logger.error(f"Error generating province features: {e}")
            raise