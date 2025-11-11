import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, List, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EarthquakeDataFetcher:
    def __init__(self):
        """Initialize Supabase client and load environment variables"""
        load_dotenv()
        
        # Get Supabase credentials
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        # Initialize Supabase client
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("✅ Supabase client initialized successfully")
        
        # Load province mapping from database
        self.province_mapping = self._load_province_mapping_from_db()
        logger.info(f"✅ Loaded {len(self.province_mapping)} provinces from database")
    
    def _load_province_mapping_from_db(self) -> Dict[int, str]:
        """Load province ID to name mapping from Supabase database"""
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
            logger.info("Falling back to empty mapping...")
            return {}
    
    def fetch_earthquakes_last_30_days(self) -> pd.DataFrame:
        """Fetch earthquakes from the last 30 days from Supabase"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            logger.info(f"Fetching earthquakes from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            
            # Query earthquakes (no need to join provinces table since we have local mapping)
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
            for eq in response.data:
                # Get province name from database mapping
                province_name = self.province_mapping.get(eq['province_id'], f'Province_{eq["province_id"]}')
                
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
    
    def fetch_all_provinces(self) -> List[Dict]:
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
            # Fallback to mapping if available
            if self.province_mapping:
                provinces = []
                for province_id, province_name in self.province_mapping.items():
                    provinces.append({
                        'province_id': province_id,
                        'province_name': province_name
                    })
                logger.info(f"✅ Using cached province mapping: {len(provinces)} provinces")
                return provinces
            else:
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
                logger.info(f"No earthquakes found for {province_name} in the last 30 days")
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
            
            logger.info(f"✅ Calculated features for {province_name}: {features['eq_count_last_30d']} earthquakes")
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
    
    def generate_province_features_json(self, output_file: Optional[str] = None) -> Dict:
        """Generate JSON file with earthquake features for all provinces"""
        try:
            # Fetch data
            earthquake_data = self.fetch_earthquakes_last_30_days()
            provinces = self.fetch_all_provinces()
            
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
            
            # Create output structure
            output_data = {
                'metadata': {
                    'generation_date': datetime.now().isoformat(),
                    'total_provinces': len(provinces),
                    'total_earthquakes_30d': len(earthquake_data),
                    'date_range': {
                        'start': (datetime.now() - timedelta(days=30)).isoformat(),
                        'end': datetime.now().isoformat()
                    }
                },
                'province_features': province_features
            }
            
            # Save to JSON file
            if output_file is None:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_file = f'province_earthquake_features_{timestamp}.json'
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_file) if os.path.dirname(output_file) else '.', exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Province features saved to: {output_file}")
            return output_data
            
        except Exception as e:
            logger.error(f"Error generating province features: {e}")
            raise
    
    def get_latest_earthquake_summary(self) -> Dict:
        """Get a summary of the latest earthquake activity"""
        try:
            earthquake_data = self.fetch_earthquakes_last_30_days()
            
            if len(earthquake_data) == 0:
                return {
                    'total_earthquakes': 0,
                    'message': 'No earthquakes found in the last 30 days'
                }
            
            summary = {
                'total_earthquakes': len(earthquake_data),
                'date_range': {
                    'start': earthquake_data['datetime'].min().isoformat(),
                    'end': earthquake_data['datetime'].max().isoformat()
                },
                'magnitude_stats': {
                    'max': float(earthquake_data['magnitude'].max()),
                    'min': float(earthquake_data['magnitude'].min()),
                    'avg': float(earthquake_data['magnitude'].mean()),
                    'std': float(earthquake_data['magnitude'].std())
                },
                'major_earthquakes': len(earthquake_data[earthquake_data['magnitude'] >= 5.0]),
                'provinces_affected': earthquake_data['province_name'].nunique(),
                'latest_earthquake': {
                    'datetime': earthquake_data.iloc[0]['datetime'].isoformat(),
                    'magnitude': float(earthquake_data.iloc[0]['magnitude']),
                    'location': earthquake_data.iloc[0]['location'],
                    'province': earthquake_data.iloc[0]['province_name']
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating earthquake summary: {e}")
            raise


def main():
    """Main function to fetch earthquake data and generate province features"""
    try:
        # Initialize fetcher
        fetcher = EarthquakeDataFetcher()
        
        # Generate summary
        print("📊 Earthquake Activity Summary (Last 30 Days)")
        print("=" * 50)
        summary = fetcher.get_latest_earthquake_summary()
        
        if summary['total_earthquakes'] > 0:
            print(f"Total Earthquakes: {summary['total_earthquakes']}")
            print(f"Major Earthquakes (≥5.0): {summary['major_earthquakes']}")
            print(f"Provinces Affected: {summary['provinces_affected']}")
            print(f"Magnitude Range: {summary['magnitude_stats']['min']:.1f} - {summary['magnitude_stats']['max']:.1f}")
            print(f"Latest Earthquake: {summary['latest_earthquake']['magnitude']:.1f} in {summary['latest_earthquake']['province']}")
            print()
        else:
            print(summary['message'])
            return
        
        # Generate province features
        print("🔄 Generating province earthquake features...")
        script_dir = os.path.dirname(__file__)
        output_file = os.path.join(script_dir, 'province_earthquake_features.json')
        
        features_data = fetcher.generate_province_features_json(output_file)
        
        print(f"✅ Successfully generated features for {features_data['metadata']['total_provinces']} provinces")
        print(f"📁 Output saved to: {output_file}")
        
        # Show some example features
        print("\n📋 Sample Province Features:")
        for i, province in enumerate(features_data['province_features'][:3]):
            print(f"{i+1}. {province['province_name']}: {province['eq_count_last_30d']} earthquakes (Max: {province['max_magnitude_last_30d']:.1f})")
        
        if len(features_data['province_features']) > 3:
            print(f"... and {len(features_data['province_features']) - 3} more provinces")
            
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise


if __name__ == '__main__':
    main()