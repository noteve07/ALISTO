#!/usr/bin/env python3
"""
Script to extract REAL province boundaries from PostgreSQL/PostGIS database
Uses actual boundaries geometry data from the provinces table
"""

import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime

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

def get_db_connection():
    """Get database connection with multiple fallback options"""
    
    # Try different common database configurations
    configs = [
        {
            'host': 'localhost',
            'database': 'alisto',
            'user': 'postgres',
            'password': 'password',
            'port': 5432
        },
        {
            'host': 'localhost',
            'database': 'alisto_db',
            'user': 'postgres',
            'password': 'admin',
            'port': 5432
        },
        {
            'host': 'localhost',
            'database': 'postgres',
            'user': 'postgres',
            'password': 'password',
            'port': 5432
        },
        # Add environment variables option
        {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'alisto'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'password'),
            'port': int(os.getenv('DB_PORT', '5432'))
        }
    ]
    
    for i, config in enumerate(configs, 1):
        try:
            print(f"Trying connection {i}: {config['database']}@{config['host']}:{config['port']}")
            conn = psycopg2.connect(**config)
            print(f"✅ Successfully connected to {config['database']}")
            return conn
        except psycopg2.Error as e:
            print(f"❌ Failed connection {i}: {e}")
            continue
    
    return None

def fetch_provinces_with_real_boundaries():
    """Fetch provinces with REAL boundaries from PostgreSQL database"""
    
    conn = get_db_connection()
    if not conn:
        print("Could not establish database connection!")
        print("\nPlease provide database details:")
        host = input("Database host (default: localhost): ") or "localhost"
        database = input("Database name: ")
        user = input("Username: ")
        password = input("Password: ")
        port = input("Port (default: 5432): ") or "5432"
        
        try:
            conn = psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port=int(port)
            )
            print("✅ Connected successfully!")
        except psycopg2.Error as e:
            print(f"❌ Connection failed: {e}")
            return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # First, let's check what columns exist
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'provinces'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print(f"\nAvailable columns in provinces table:")
        for col in columns:
            print(f"  - {col['column_name']}: {col['data_type']}")
        
        # Query to get provinces with boundaries as GeoJSON
        # ST_AsGeoJSON converts PostGIS geometry to GeoJSON format
        query = """
        SELECT 
            province_id,
            name,
            ST_AsGeoJSON(boundaries) as geometry,
            ST_AsGeoJSON(ST_Centroid(boundaries)) as centroid_geom,
            ST_Area(boundaries) as area
        FROM provinces 
        WHERE boundaries IS NOT NULL
        ORDER BY province_id;
        """
        
        print(f"\nExecuting query to fetch province boundaries...")
        cursor.execute(query)
        provinces = cursor.fetchall()
        
        print(f"✅ Fetched {len(provinces)} provinces with real boundaries from database")
        
        # Show sample of what we got
        if provinces:
            sample = provinces[0]
            print(f"\nSample province data:")
            print(f"  - ID: {sample['province_id']}")
            print(f"  - Name: {sample['name']}")
            print(f"  - Has geometry: {'Yes' if sample['geometry'] else 'No'}")
            print(f"  - Has centroid: {'Yes' if sample['centroid_geom'] else 'No'}")
            
        return provinces
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        
        # If the main query fails, try to understand the table structure
        try:
            cursor.execute("SELECT * FROM provinces LIMIT 1;")
            sample = cursor.fetchone()
            if sample:
                print(f"\nSample row from provinces table:")
                for key, value in sample.items():
                    print(f"  - {key}: {type(value).__name__}")
        except:
            pass
            
        return []
    except Exception as e:
        print(f"❌ Error: {e}")
        return []
    finally:
        if conn:
            conn.close()

def create_geojson_with_real_boundaries(provinces_data, risk_by_id, risk_by_name, metadata):
    """Create GeoJSON FeatureCollection with REAL boundaries and risk data"""
    features = []
    matched_count = 0
    invalid_geometry_count = 0
    
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
        
        # Parse REAL geometry from PostGIS
        geometry = None
        if province['geometry']:
            try:
                geometry = json.loads(province['geometry'])
                print(f"✅ Parsed geometry for {province_name}")
            except json.JSONDecodeError as e:
                print(f"❌ Invalid geometry for {province_name}: {e}")
                invalid_geometry_count += 1
                continue
        else:
            print(f"⚠️  No geometry for {province_name}")
            invalid_geometry_count += 1
            continue
        
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
            'area': float(province.get('area', 0)) if province.get('area') else 0
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
        
        # Create feature with REAL geometry
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
            'valid_geometries': len(features),
            'invalid_geometries': invalid_geometry_count,
            'matched_with_risk_data': matched_count,
            'generated_date': datetime.now().isoformat(),
            'data_source': 'real_postgres_boundaries',
            'risk_prediction_metadata': metadata
        }
    }
    
    print(f"\n📊 GeoJSON Summary:")
    print(f"  - Total provinces from DB: {len(provinces_data)}")
    print(f"  - Valid geometries: {len(features)}")
    print(f"  - Invalid geometries: {invalid_geometry_count}")
    print(f"  - Matched with risk data: {matched_count}")
    
    return geojson

def main():
    """Main function to generate provinces GeoJSON with REAL boundaries"""
    print("=" * 60)
    print("🌏 REAL Province Boundaries + Risk Data Generator")
    print("=" * 60)
    
    # Load risk predictions
    print("\n1️⃣ Loading risk predictions...")
    risk_by_id, risk_by_name, metadata = load_risk_predictions()
    
    # Fetch REAL provinces from database
    print("\n2️⃣ Fetching REAL provinces boundaries from database...")
    provinces_data = fetch_provinces_with_real_boundaries()
    
    if not provinces_data:
        print("❌ No province data retrieved from database.")
        print("Please check your database connection and table structure.")
        return
    
    # Create GeoJSON with REAL boundaries and risk data
    print("\n3️⃣ Creating GeoJSON with REAL boundaries and risk data...")
    geojson = create_geojson_with_real_boundaries(provinces_data, risk_by_id, risk_by_name, metadata)
    
    # Save to file
    output_file = 'provinces_real.json'
    print(f"\n4️⃣ Saving to {output_file}...")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully saved REAL provinces GeoJSON to {output_file}")
        
        # Print detailed summary
        print(f"\n" + "=" * 60)
        print(f"📈 FINAL SUMMARY")
        print(f"=" * 60)
        print(f"📁 File: {output_file}")
        print(f"🏛️  Total provinces: {geojson['metadata']['total_provinces']}")
        print(f"✅ Valid geometries: {geojson['metadata']['valid_geometries']}")
        print(f"❌ Invalid geometries: {geojson['metadata']['invalid_geometries']}")
        print(f"🎯 Matched with risk data: {geojson['metadata']['matched_with_risk_data']}")
        
        # Risk distribution
        risk_counts = {'High': 0, 'Medium': 0, 'Low': 0, 'No Data': 0}
        for feature in geojson['features']:
            risk_level = feature['properties'].get('risk_level', 'No Data')
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
            else:
                risk_counts['No Data'] += 1
        
        print(f"\n🚨 Risk levels distribution:")
        for level, count in risk_counts.items():
            emoji = {'High': '🔴', 'Medium': '🟡', 'Low': '🟢', 'No Data': '⚪'}
            print(f"  {emoji.get(level, '⚪')} {level}: {count}")
            
        print(f"\n🎉 SUCCESS! You now have REAL province boundaries with earthquake risk data!")
        print(f"🗺️  Use {output_file} with your earthquake risk map for accurate visualization.")
            
    except IOError as e:
        print(f"❌ Error saving file: {e}")

if __name__ == "__main__":
    main()