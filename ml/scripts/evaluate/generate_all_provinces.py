#!/usr/bin/env python3
"""
Comprehensive script to create provinces.json with all 82 Philippines provinces
Uses approximate real coordinates for all provinces
"""

import json
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

def get_all_philippines_provinces():
    """Get all 82 Philippines provinces with approximate coordinates"""
    
    provinces = [
        # Luzon - Region I (Ilocos Region)
        {'province_id': 34, 'name': 'Ilocos Norte', 'coordinates': [[[120.2, 17.8], [120.8, 17.8], [120.8, 18.6], [120.2, 18.6], [120.2, 17.8]]]},
        {'province_id': 35, 'name': 'Ilocos Sur', 'coordinates': [[[120.1, 16.8], [120.7, 16.8], [120.7, 17.8], [120.1, 17.8], [120.1, 16.8]]]},
        {'province_id': 39, 'name': 'La Union', 'coordinates': [[[120.2, 16.2], [120.8, 16.2], [120.8, 16.8], [120.2, 16.8], [120.2, 16.2]]]},
        {'province_id': 61, 'name': 'Pangasinan', 'coordinates': [[[119.8, 15.4], [120.8, 15.4], [120.8, 16.4], [119.8, 16.4], [119.8, 15.4]]]},
        
        # Luzon - Region II (Cagayan Valley)
        {'province_id': 11, 'name': 'Batanes', 'coordinates': [[[121.8, 20.2], [122.2, 20.2], [122.2, 20.6], [121.8, 20.6], [121.8, 20.2]]]},
        {'province_id': 18, 'name': 'Cagayan', 'coordinates': [[[121.3, 17.8], [122.2, 17.8], [122.2, 18.6], [121.3, 18.6], [121.3, 17.8]]]},
        {'province_id': 37, 'name': 'Isabela', 'coordinates': [[[121.2, 16.5], [122.3, 16.5], [122.3, 17.8], [121.2, 17.8], [121.2, 16.5]]]},
        {'province_id': 56, 'name': 'Nueva Vizcaya', 'coordinates': [[[120.8, 15.8], [121.8, 15.8], [121.8, 16.8], [120.8, 16.8], [120.8, 15.8]]]},
        {'province_id': 62, 'name': 'Quirino', 'coordinates': [[[121.3, 16.0], [121.8, 16.0], [121.8, 16.5], [121.3, 16.5], [121.3, 16.0]]]},
        
        # Luzon - Region III (Central Luzon)
        {'province_id': 8, 'name': 'Aurora', 'coordinates': [[[121.4, 15.4], [122.2, 15.4], [122.2, 16.5], [121.4, 16.5], [121.4, 15.4]]]},
        {'province_id': 10, 'name': 'Bataan', 'coordinates': [[[120.3, 14.3], [120.7, 14.3], [120.7, 14.9], [120.3, 14.9], [120.3, 14.3]]]},
        {'province_id': 17, 'name': 'Bulacan', 'coordinates': [[[120.7, 14.5], [121.2, 14.5], [121.2, 15.0], [120.7, 15.0], [120.7, 14.5]]]},
        {'province_id': 55, 'name': 'Nueva Ecija', 'coordinates': [[[120.6, 15.0], [121.5, 15.0], [121.5, 15.8], [120.6, 15.8], [120.6, 15.0]]]},
        {'province_id': 60, 'name': 'Pampanga', 'coordinates': [[[120.4, 14.8], [120.9, 14.8], [120.9, 15.3], [120.4, 15.3], [120.4, 14.8]]]},
        {'province_id': 73, 'name': 'Tarlac', 'coordinates': [[[120.4, 15.2], [120.9, 15.2], [120.9, 15.8], [120.4, 15.8], [120.4, 15.2]]]},
        {'province_id': 77, 'name': 'Zambales', 'coordinates': [[[119.8, 14.8], [120.5, 14.8], [120.5, 16.0], [119.8, 16.0], [119.8, 14.8]]]},
        
        # Luzon - CAR (Cordillera Administrative Region)
        {'province_id': 1, 'name': 'Abra', 'coordinates': [[[120.5, 17.4], [121.0, 17.4], [121.0, 17.9], [120.5, 17.9], [120.5, 17.4]]]},
        {'province_id': 7, 'name': 'Apayao', 'coordinates': [[[120.8, 17.9], [121.3, 17.9], [121.3, 18.5], [120.8, 18.5], [120.8, 17.9]]]},
        {'province_id': 13, 'name': 'Benguet', 'coordinates': [[[120.4, 16.2], [121.0, 16.2], [121.0, 16.8], [120.4, 16.8], [120.4, 16.2]]]},
        {'province_id': 33, 'name': 'Ifugao', 'coordinates': [[[121.0, 16.6], [121.5, 16.6], [121.5, 17.2], [121.0, 17.2], [121.0, 16.6]]]},
        {'province_id': 38, 'name': 'Kalinga', 'coordinates': [[[121.0, 17.2], [121.8, 17.2], [121.8, 17.9], [121.0, 17.9], [121.0, 17.2]]]},
        {'province_id': 50, 'name': 'Mountain Province', 'coordinates': [[[120.8, 16.8], [121.3, 16.8], [121.3, 17.4], [120.8, 17.4], [120.8, 16.8]]]},
        
        # Luzon - Region IV-A (CALABARZON)
        {'province_id': 12, 'name': 'Batangas', 'coordinates': [[[120.8, 13.6], [121.5, 13.6], [121.5, 14.4], [120.8, 14.4], [120.8, 13.6]]]},
        {'province_id': 24, 'name': 'Cavite', 'coordinates': [[[120.6, 14.1], [121.0, 14.1], [121.0, 14.5], [120.6, 14.5], [120.6, 14.1]]]},
        {'province_id': 40, 'name': 'Laguna', 'coordinates': [[[121.0, 14.0], [121.6, 14.0], [121.6, 14.6], [121.0, 14.6], [121.0, 14.0]]]},
        {'province_id': 62, 'name': 'Quezon', 'coordinates': [[[121.3, 13.4], [122.6, 13.4], [122.6, 15.0], [121.3, 15.0], [121.3, 13.4]]]},
        {'province_id': 64, 'name': 'Rizal', 'coordinates': [[[121.0, 14.2], [121.4, 14.2], [121.4, 14.8], [121.0, 14.8], [121.0, 14.2]]]},
        
        # Luzon - Region IV-B (MIMAROPA)
        {'province_id': 45, 'name': 'Marinduque', 'coordinates': [[[121.8, 13.3], [122.0, 13.3], [122.0, 13.6], [121.8, 13.6], [121.8, 13.3]]]},
        {'province_id': 57, 'name': 'Occidental Mindoro', 'coordinates': [[[120.8, 12.8], [121.5, 12.8], [121.5, 13.8], [120.8, 13.8], [120.8, 12.8]]]},
        {'province_id': 58, 'name': 'Oriental Mindoro', 'coordinates': [[[121.2, 12.8], [121.8, 12.8], [121.8, 13.8], [121.2, 13.8], [121.2, 12.8]]]},
        {'province_id': 59, 'name': 'Palawan', 'coordinates': [[[117.0, 8.0], [119.5, 8.0], [119.5, 11.5], [117.0, 11.5], [117.0, 8.0]]]},
        {'province_id': 65, 'name': 'Romblon', 'coordinates': [[[122.1, 12.3], [122.8, 12.3], [122.8, 12.9], [122.1, 12.9], [122.1, 12.3]]]},
        
        # Luzon - Region V (Bicol)
        {'province_id': 5, 'name': 'Albay', 'coordinates': [[[123.4, 13.0], [124.2, 13.0], [124.2, 13.5], [123.4, 13.5], [123.4, 13.0]]]},
        {'province_id': 19, 'name': 'Camarines Norte', 'coordinates': [[[122.5, 13.8], [123.0, 13.8], [123.0, 14.4], [122.5, 14.4], [122.5, 13.8]]]},
        {'province_id': 20, 'name': 'Camarines Sur', 'coordinates': [[[123.0, 13.2], [123.8, 13.2], [123.8, 14.2], [123.0, 14.2], [123.0, 13.2]]]},
        {'province_id': 23, 'name': 'Catanduanes', 'coordinates': [[[124.1, 13.4], [124.5, 13.4], [124.5, 14.0], [124.1, 14.0], [124.1, 13.4]]]},
        {'province_id': 46, 'name': 'Masbate', 'coordinates': [[[123.4, 12.0], [124.4, 12.0], [124.4, 12.8], [123.4, 12.8], [123.4, 12.0]]]},
        {'province_id': 70, 'name': 'Sorsogon', 'coordinates': [[[123.8, 12.6], [124.6, 12.6], [124.6, 13.1], [123.8, 13.1], [123.8, 12.6]]]},
        
        # NCR (National Capital Region)
        {'province_id': 47, 'name': 'Metropolitan Manila', 'coordinates': [[[120.9, 14.4], [121.1, 14.4], [121.1, 14.8], [120.9, 14.8], [120.9, 14.4]]]},
        
        # Visayas - Region VI (Western Visayas)
        {'province_id': 4, 'name': 'Aklan', 'coordinates': [[[121.8, 11.3], [122.4, 11.3], [122.4, 12.0], [121.8, 12.0], [121.8, 11.3]]]},
        {'province_id': 6, 'name': 'Antique', 'coordinates': [[[121.8, 10.4], [122.4, 10.4], [122.4, 11.4], [121.8, 11.4], [121.8, 10.4]]]},
        {'province_id': 22, 'name': 'Capiz', 'coordinates': [[[122.4, 11.3], [123.0, 11.3], [123.0, 11.8], [122.4, 11.8], [122.4, 11.3]]]},
        {'province_id': 32, 'name': 'Guimaras', 'coordinates': [[[122.5, 10.5], [122.8, 10.5], [122.8, 10.7], [122.5, 10.7], [122.5, 10.5]]]},
        {'province_id': 36, 'name': 'Iloilo', 'coordinates': [[[122.3, 10.4], [123.0, 10.4], [123.0, 11.2], [122.3, 11.2], [122.3, 10.4]]]},
        {'province_id': 51, 'name': 'Negros Occidental', 'coordinates': [[[122.8, 9.8], [123.4, 9.8], [123.4, 11.0], [122.8, 11.0], [122.8, 9.8]]]},
        
        # Visayas - Region VII (Central Visayas)
        {'province_id': 15, 'name': 'Bohol', 'coordinates': [[[123.7, 9.5], [124.5, 9.5], [124.5, 10.2], [123.7, 10.2], [123.7, 9.5]]]},
        {'province_id': 25, 'name': 'Cebu', 'coordinates': [[[123.2, 9.3], [124.0, 9.3], [124.0, 11.3], [123.2, 11.3], [123.2, 9.3]]]},
        {'province_id': 52, 'name': 'Negros Oriental', 'coordinates': [[[123.0, 9.0], [123.4, 9.0], [123.4, 10.4], [123.0, 10.4], [123.0, 9.0]]]},
        {'province_id': 69, 'name': 'Siquijor', 'coordinates': [[[123.4, 9.1], [123.6, 9.1], [123.6, 9.3], [123.4, 9.3], [123.4, 9.1]]]},
        
        # Visayas - Region VIII (Eastern Visayas)
        {'province_id': 14, 'name': 'Biliran', 'coordinates': [[[124.4, 11.4], [124.6, 11.4], [124.6, 11.7], [124.4, 11.7], [124.4, 11.4]]]},
        {'province_id': 31, 'name': 'Eastern Samar', 'coordinates': [[[125.2, 11.0], [126.0, 11.0], [126.0, 12.6], [125.2, 12.6], [125.2, 11.0]]]},
        {'province_id': 43, 'name': 'Leyte', 'coordinates': [[[124.3, 10.7], [125.2, 10.7], [125.2, 11.8], [124.3, 11.8], [124.3, 10.7]]]},
        {'province_id': 54, 'name': 'Northern Samar', 'coordinates': [[[124.3, 12.0], [125.2, 12.0], [125.2, 12.9], [124.3, 12.9], [124.3, 12.0]]]},
        {'province_id': 66, 'name': 'Samar', 'coordinates': [[[124.6, 11.4], [125.4, 11.4], [125.4, 12.0], [124.6, 12.0], [124.6, 11.4]]]},
        {'province_id': 72, 'name': 'Southern Leyte', 'coordinates': [[[124.8, 9.8], [125.6, 9.8], [125.6, 10.8], [124.8, 10.8], [124.8, 9.8]]]},
        
        # Mindanao - Region IX (Zamboanga Peninsula)
        {'province_id': 78, 'name': 'Zamboanga Del Norte', 'coordinates': [[[122.2, 8.0], [123.4, 8.0], [123.4, 9.0], [122.2, 9.0], [122.2, 8.0]]]},
        {'province_id': 79, 'name': 'Zamboanga Del Sur', 'coordinates': [[[122.0, 7.0], [123.2, 7.0], [123.2, 8.2], [122.0, 8.2], [122.0, 7.0]]]},
        {'province_id': 80, 'name': 'Zamboanga Sibugay', 'coordinates': [[[122.0, 7.2], [122.8, 7.2], [122.8, 8.0], [122.0, 8.0], [122.0, 7.2]]]},
        
        # Mindanao - Region X (Northern Mindanao)
        {'province_id': 16, 'name': 'Bukidnon', 'coordinates': [[[124.4, 7.6], [125.4, 7.6], [125.4, 8.6], [124.4, 8.6], [124.4, 7.6]]]},
        {'province_id': 21, 'name': 'Camiguin', 'coordinates': [[[124.6, 9.0], [124.8, 9.0], [124.8, 9.3], [124.6, 9.3], [124.6, 9.0]]]},
        {'province_id': 41, 'name': 'Lanao Del Norte', 'coordinates': [[[123.4, 7.8], [124.4, 7.8], [124.4, 8.8], [123.4, 8.8], [123.4, 7.8]]]},
        {'province_id': 48, 'name': 'Misamis Occidental', 'coordinates': [[[123.2, 8.2], [124.2, 8.2], [124.2, 9.0], [123.2, 9.0], [123.2, 8.2]]]},
        {'province_id': 49, 'name': 'Misamis Oriental', 'coordinates': [[[124.2, 8.2], [125.2, 8.2], [125.2, 9.2], [124.2, 9.2], [124.2, 8.2]]]},
        
        # Mindanao - Region XI (Davao Region)
        {'province_id': 26, 'name': 'Compostela Valley', 'coordinates': [[[125.8, 7.2], [126.4, 7.2], [126.4, 8.0], [125.8, 8.0], [125.8, 7.2]]]},
        {'province_id': 27, 'name': 'Davao Del Norte', 'coordinates': [[[125.3, 7.2], [126.0, 7.2], [126.0, 8.0], [125.3, 8.0], [125.3, 7.2]]]},
        {'province_id': 28, 'name': 'Davao Occidental', 'coordinates': [[[125.1, 6.4], [125.8, 6.4], [125.8, 7.3], [125.1, 7.3], [125.1, 6.4]]]},
        {'province_id': 29, 'name': 'Davao De Oro', 'coordinates': [[[126.0, 7.0], [126.7, 7.0], [126.7, 8.0], [126.0, 8.0], [126.0, 7.0]]]},
        {'province_id': 75, 'name': 'Davao Del Sur', 'coordinates': [[[125.1, 6.2], [125.8, 6.2], [125.8, 7.4], [125.1, 7.4], [125.1, 6.2]]]},
        
        # Mindanao - Region XII (SOCCSKSARGEN)
        {'province_id': 53, 'name': 'North Cotabato', 'coordinates': [[[124.2, 6.8], [125.2, 6.8], [125.2, 7.8], [124.2, 7.8], [124.2, 6.8]]]},
        {'province_id': 67, 'name': 'Sarangani', 'coordinates': [[[125.2, 5.4], [126.0, 5.4], [126.0, 6.2], [125.2, 6.2], [125.2, 5.4]]]},
        {'province_id': 71, 'name': 'South Cotabato', 'coordinates': [[[124.6, 6.0], [125.4, 6.0], [125.4, 6.8], [124.6, 6.8], [124.6, 6.0]]]},
        {'province_id': 74, 'name': 'Sultan Kudarat', 'coordinates': [[[124.0, 6.2], [124.8, 6.2], [124.8, 7.0], [124.0, 7.0], [124.0, 6.2]]]},
        
        # Mindanao - Region XIII (Caraga)
        {'province_id': 2, 'name': 'Agusan Del Norte', 'coordinates': [[[125.2, 8.7], [126.0, 8.7], [126.0, 9.4], [125.2, 9.4], [125.2, 8.7]]]},
        {'province_id': 3, 'name': 'Agusan Del Sur', 'coordinates': [[[125.4, 8.0], [126.2, 8.0], [126.2, 8.9], [125.4, 8.9], [125.4, 8.0]]]},
        {'province_id': 30, 'name': 'Dinagat Islands', 'coordinates': [[[126.0, 10.0], [126.4, 10.0], [126.4, 10.4], [126.0, 10.4], [126.0, 10.0]]]},
        {'province_id': 76, 'name': 'Surigao Del Norte', 'coordinates': [[[125.2, 9.4], [126.2, 9.4], [126.2, 10.4], [125.2, 10.4], [125.2, 9.4]]]},
        {'province_id': 81, 'name': 'Surigao Del Sur', 'coordinates': [[[125.8, 8.4], [126.8, 8.4], [126.8, 9.4], [125.8, 9.4], [125.8, 8.4]]]},
        
        # Mindanao - ARMM/BARMM
        {'province_id': 9, 'name': 'Basilan', 'coordinates': [[[121.8, 6.2], [122.4, 6.2], [122.4, 6.8], [121.8, 6.8], [121.8, 6.2]]]},
        {'province_id': 42, 'name': 'Lanao Del Sur', 'coordinates': [[[123.8, 7.2], [124.8, 7.2], [124.8, 8.2], [123.8, 8.2], [123.8, 7.2]]]},
        {'province_id': 44, 'name': 'Maguindanao Del Norte', 'coordinates': [[[124.0, 7.0], [124.8, 7.0], [124.8, 7.8], [124.0, 7.8], [124.0, 7.0]]]},
        {'province_id': 63, 'name': 'Maguindanao Del Sur', 'coordinates': [[[124.2, 6.2], [125.0, 6.2], [125.0, 7.2], [124.2, 7.2], [124.2, 6.2]]]},
        {'province_id': 68, 'name': 'Shariff Kabunsuan', 'coordinates': [[[124.4, 7.2], [125.0, 7.2], [125.0, 7.8], [124.4, 7.8], [124.4, 7.2]]]},
        {'province_id': 74, 'name': 'Sulu', 'coordinates': [[[120.8, 5.8], [121.4, 5.8], [121.4, 6.4], [120.8, 6.4], [120.8, 5.8]]]},
        {'province_id': 75, 'name': 'Tawi-Tawi', 'coordinates': [[[119.8, 4.8], [120.4, 4.8], [120.4, 5.4], [119.8, 5.4], [119.8, 4.8]]]},
    ]
    
    return provinces

def create_geojson_features(provinces, risk_by_id, risk_by_name):
    """Create GeoJSON features from provinces and risk data"""
    features = []
    matched_count = 0
    
    for province in provinces:
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
        
        # Create geometry
        geometry = {
            'type': 'Polygon',
            'coordinates': province['coordinates']
        }
        
        # Create feature
        feature = {
            'type': 'Feature',
            'properties': properties,
            'geometry': geometry
        }
        
        features.append(feature)
    
    print(f"Created {len(features)} features, {matched_count} matched with risk data")
    return features, matched_count

def main():
    """Main function to generate comprehensive provinces.json"""
    print("=== Comprehensive Province Risk Data Generator ===")
    
    # Load risk predictions
    print("\n1. Loading risk predictions...")
    risk_by_id, risk_by_name, metadata = load_risk_predictions()
    
    # Get all Philippines provinces
    print("\n2. Loading all Philippines provinces...")
    provinces = get_all_philippines_provinces()
    print(f"Loaded {len(provinces)} provinces")
    
    # Create GeoJSON features
    print("\n3. Creating GeoJSON features...")
    features, matched_count = create_geojson_features(provinces, risk_by_id, risk_by_name)
    
    # Create final GeoJSON
    geojson = {
        'type': 'FeatureCollection',
        'features': features,
        'metadata': {
            'total_provinces': len(provinces),
            'matched_with_risk_data': matched_count,
            'generated_date': datetime.now().isoformat(),
            'data_source': 'comprehensive_philippines_provinces',
            'risk_prediction_metadata': metadata
        }
    }
    
    # Save to file
    output_file = 'provinces.json'
    print(f"\n4. Saving to {output_file}...")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved comprehensive provinces GeoJSON to {output_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total provinces: {len(features)}")
        print(f"- Matched with risk data: {matched_count}")
        print(f"- Unmatched: {len(features) - matched_count}")
        print(f"- Risk levels distribution:")
        
        risk_counts = {'High': 0, 'Medium': 0, 'Low': 0, 'No Data': 0}
        for feature in features:
            risk_level = feature['properties'].get('risk_level', 'No Data')
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
            else:
                risk_counts['No Data'] += 1
        
        for level, count in risk_counts.items():
            print(f"  - {level}: {count}")
            
        print(f"\nGenerated comprehensive provinces.json with all Philippines provinces!")
        print(f"You can now use this with the earthquake risk map to see all provinces.")
            
    except IOError as e:
        print(f"Error saving file: {e}")

if __name__ == "__main__":
    main()