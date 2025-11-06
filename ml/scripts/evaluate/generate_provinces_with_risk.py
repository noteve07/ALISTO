#!/usr/bin/env python3
"""
Script to generate provinces GeoJSON with earthquake risk data
Fetches province boundaries from database and matches with risk predictions
"""

import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'your_database'),
    'user': os.getenv('DB_USER', 'your_user'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'port': os.getenv('DB_PORT', '5432')
}

def load_risk_predictions(file_path='province_earthquake_risk_predictions.json'):
    """Load earthquake risk predictions from JSON file"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Create lookup dictionaries
        risk_by_id = {}
        risk_by_name = {}
        
        if 'risk_predictions' in data and isinstance(data['risk_predictions'], list):
            for prediction in data['risk_predictions']:
                # By ID
                if 'province_id' in prediction:
                    risk_by_id[prediction['province_id']] = prediction
                
                # By name (normalized)
                if 'province_name' in prediction:
                    name_key = prediction['province_name'].lower().strip()
                    risk_by_name[name_key] = prediction
        
        print(f"Loaded {len(risk_by_id)} risk predictions")
        return risk_by_id, risk_by_name, data.get('metadata', {})
    
    except FileNotFoundError:
        print(f"Risk predictions file not found: {file_path}")
        return {}, {}, {}
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file: {e}")
        return {}, {}, {}

def fetch_provinces_from_db():
    """Fetch provinces with boundaries from PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Query to get provinces with boundaries as GeoJSON
        query = """
        SELECT 
            province_id,
            name,
            ST_AsGeoJSON(boundaries) as geometry,
            ST_AsGeoJSON(centroid) as centroid_geom
        FROM provinces 
        WHERE boundaries IS NOT NULL
        ORDER BY province_id;
        """
        
        cursor.execute(query)
        provinces = cursor.fetchall()
        
        print(f"Fetched {len(provinces)} provinces from database")
        return provinces
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return []
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()

def create_geojson_with_risk(provinces_data, risk_by_id, risk_by_name, metadata):
    """Create GeoJSON FeatureCollection with risk data"""
    features = []
    matched_count = 0
    
    for province in provinces_data:
        province_id = province['province_id']
        province_name = province['name']
        
        # Try to find matching risk data
        risk_data = None
        
        # First try by ID
        if province_id in risk_by_id:
            risk_data = risk_by_id[province_id]
            matched_count += 1
        # Then try by name (case-insensitive)
        elif province_name.lower().strip() in risk_by_name:
            risk_data = risk_by_name[province_name.lower().strip()]
            matched_count += 1
        
        # Parse geometry
        geometry = None
        if province['geometry']:
            try:
                geometry = json.loads(province['geometry'])
            except json.JSONDecodeError:
                print(f"Invalid geometry for province {province_name}")
        
        # Parse centroid
        centroid = None
        if province['centroid_geom']:
            try:
                centroid = json.loads(province['centroid_geom'])
            except json.JSONDecodeError:
                pass
        
        # Create feature properties
        properties = {
            'province_id': province_id,
            'province_name': province_name,
            'name': province_name,  # Alias for compatibility
            'PROVINCE_NAME': province_name.upper(),  # Another alias
        }
        
        # Add risk data if available
        if risk_data:
            properties.update({
                'risk_level': risk_data.get('risk_level', 'No Data'),
                'risk_probabilities': risk_data.get('risk_probabilities', {}),
                'major_earthquake_risk': risk_data.get('major_earthquake_risk', {}),
                'prediction_date': risk_data.get('prediction_date'),
                'input_features': risk_data.get('input_features', {})
            })
        else:
            properties.update({
                'risk_level': 'No Data',
                'risk_probabilities': {},
                'major_earthquake_risk': {},
                'prediction_date': None,
                'input_features': {}
            })
        
        # Add centroid coordinates if available
        if centroid and centroid.get('coordinates'):
            properties['centroid_lat'] = centroid['coordinates'][1]
            properties['centroid_lng'] = centroid['coordinates'][0]
        
        # Create feature
        feature = {
            'type': 'Feature',
            'properties': properties,
            'geometry': geometry
        }
        
        features.append(feature)
    
    # Create FeatureCollection
    geojson = {
        'type': 'FeatureCollection',
        'features': features,
        'metadata': {
            'total_provinces': len(provinces_data),
            'matched_with_risk_data': matched_count,
            'generated_date': datetime.now().isoformat(),
            'risk_prediction_metadata': metadata
        }
    }
    
    print(f"Created GeoJSON with {len(features)} provinces")
    print(f"Matched {matched_count} provinces with risk data")
    
    return geojson

def create_mock_provinces():
    """Create mock province data if database is not available"""
    print("Creating mock province data...")
    
    # Sample provinces with mock coordinates (you should replace with actual data)
    mock_provinces = [
        {
            'province_id': 1,
            'name': 'Abra',
            'geometry': json.dumps({
                'type': 'Polygon',
                'coordinates': [[[120.5, 17.5], [120.8, 17.5], [120.8, 17.8], [120.5, 17.8], [120.5, 17.5]]]
            }),
            'centroid_geom': json.dumps({
                'type': 'Point',
                'coordinates': [120.65, 17.65]
            })
        },
        {
            'province_id': 2,
            'name': 'Agusan Del Norte',
            'geometry': json.dumps({
                'type': 'Polygon',
                'coordinates': [[[125.5, 8.5], [126.0, 8.5], [126.0, 9.0], [125.5, 9.0], [125.5, 8.5]]]
            }),
            'centroid_geom': json.dumps({
                'type': 'Point',
                'coordinates': [125.75, 8.75]
            })
        },
        # Add more provinces as needed...
    ]
    
    print(f"Generated {len(mock_provinces)} mock provinces")
    return mock_provinces

def main():
    """Main function to generate provinces GeoJSON with risk data"""
    print("=== Province Risk Data Generator ===")
    
    # Load risk predictions
    print("\n1. Loading risk predictions...")
    risk_by_id, risk_by_name, metadata = load_risk_predictions()
    
    # Fetch provinces from database
    print("\n2. Fetching provinces from database...")
    provinces_data = fetch_provinces_from_db()
    
    # If no data from database, use mock data
    if not provinces_data:
        print("No provinces data from database, using mock data...")
        provinces_data = create_mock_provinces()
    
    # Create GeoJSON with risk data
    print("\n3. Creating GeoJSON with risk data...")
    geojson = create_geojson_with_risk(provinces_data, risk_by_id, risk_by_name, metadata)
    
    # Save to file
    output_file = 'provinces.json'
    print(f"\n4. Saving to {output_file}...")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved provinces GeoJSON to {output_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total provinces: {geojson['metadata']['total_provinces']}")
        print(f"- Matched with risk data: {geojson['metadata']['matched_with_risk_data']}")
        print(f"- Risk levels distribution:")
        
        risk_counts = {'High': 0, 'Medium': 0, 'Low': 0, 'No Data': 0}
        for feature in geojson['features']:
            risk_level = feature['properties'].get('risk_level', 'No Data')
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
            else:
                risk_counts['No Data'] += 1
        
        for level, count in risk_counts.items():
            print(f"  - {level}: {count}")
            
    except IOError as e:
        print(f"Error saving file: {e}")

if __name__ == "__main__":
    main()