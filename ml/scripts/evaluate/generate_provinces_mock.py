#!/usr/bin/env python3
"""
Simple script to create provinces.json with mock data for testing
This version doesn't require database access
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

def create_mock_provinces_with_coordinates():
    """Create mock province data with approximate real coordinates for Philippines"""
    
    # Sample provinces with approximate real coordinates
    mock_provinces = [
        # Luzon
        {'province_id': 1, 'name': 'Abra', 'coordinates': [[[120.5, 17.4], [121.0, 17.4], [121.0, 17.9], [120.5, 17.9], [120.5, 17.4]]]},
        {'province_id': 11, 'name': 'Batanes', 'coordinates': [[[121.8, 20.2], [122.2, 20.2], [122.2, 20.6], [121.8, 20.6], [121.8, 20.2]]]},
        {'province_id': 17, 'name': 'Bulacan', 'coordinates': [[[120.7, 14.5], [121.2, 14.5], [121.2, 15.0], [120.7, 15.0], [120.7, 14.5]]]},
        {'province_id': 18, 'name': 'Cagayan', 'coordinates': [[[121.3, 17.8], [122.2, 17.8], [122.2, 18.6], [121.3, 18.6], [121.3, 17.8]]]},
        {'province_id': 47, 'name': 'Metropolitan Manila', 'coordinates': [[[120.9, 14.4], [121.1, 14.4], [121.1, 14.8], [120.9, 14.8], [120.9, 14.4]]]},
        
        # Visayas  
        {'province_id': 15, 'name': 'Bohol', 'coordinates': [[[123.7, 9.5], [124.5, 9.5], [124.5, 10.2], [123.7, 10.2], [123.7, 9.5]]]},
        {'province_id': 25, 'name': 'Cebu', 'coordinates': [[[123.2, 9.3], [124.0, 9.3], [124.0, 11.3], [123.2, 11.3], [123.2, 9.3]]]},
        {'province_id': 43, 'name': 'Leyte', 'coordinates': [[[124.3, 10.7], [125.2, 10.7], [125.2, 11.8], [124.3, 11.8], [124.3, 10.7]]]},
        {'province_id': 36, 'name': 'Iloilo', 'coordinates': [[[122.3, 10.4], [123.0, 10.4], [123.0, 11.2], [122.3, 11.2], [122.3, 10.4]]]},
        {'province_id': 51, 'name': 'Negros Occidental', 'coordinates': [[[122.8, 9.8], [123.4, 9.8], [123.4, 11.0], [122.8, 11.0], [122.8, 9.8]]]},
        
        # Mindanao
        {'province_id': 2, 'name': 'Agusan Del Norte', 'coordinates': [[[125.2, 8.7], [126.0, 8.7], [126.0, 9.4], [125.2, 9.4], [125.2, 8.7]]]},
        {'province_id': 3, 'name': 'Agusan Del Sur', 'coordinates': [[[125.4, 8.0], [126.2, 8.0], [126.2, 8.9], [125.4, 8.9], [125.4, 8.0]]]},
        {'province_id': 27, 'name': 'Davao Del Norte', 'coordinates': [[[125.3, 7.2], [126.0, 7.2], [126.0, 8.0], [125.3, 8.0], [125.3, 7.2]]]},
        {'province_id': 28, 'name': 'Davao Occidental', 'coordinates': [[[125.1, 6.4], [125.8, 6.4], [125.8, 7.3], [125.1, 7.3], [125.1, 6.4]]]},
        {'province_id': 29, 'name': 'Davao De Oro', 'coordinates': [[[126.0, 7.0], [126.7, 7.0], [126.7, 8.0], [126.0, 8.0], [126.0, 7.0]]]},
        {'province_id': 59, 'name': 'Palawan', 'coordinates': [[[117.0, 8.0], [119.5, 8.0], [119.5, 11.5], [117.0, 11.5], [117.0, 8.0]]]},
    ]
    
    return mock_provinces

def create_geojson_features(mock_provinces, risk_by_id, risk_by_name):
    """Create GeoJSON features from mock provinces and risk data"""
    features = []
    matched_count = 0
    
    for province in mock_provinces:
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
    """Main function to generate test provinces.json"""
    print("=== Mock Province Risk Data Generator ===")
    
    # Load risk predictions
    print("\n1. Loading risk predictions...")
    risk_by_id, risk_by_name, metadata = load_risk_predictions()
    
    # Create mock provinces
    print("\n2. Creating mock provinces...")
    mock_provinces = create_mock_provinces_with_coordinates()
    
    # Create GeoJSON features
    print("\n3. Creating GeoJSON features...")
    features, matched_count = create_geojson_features(mock_provinces, risk_by_id, risk_by_name)
    
    # Create final GeoJSON
    geojson = {
        'type': 'FeatureCollection',
        'features': features,
        'metadata': {
            'total_provinces': len(mock_provinces),
            'matched_with_risk_data': matched_count,
            'generated_date': datetime.now().isoformat(),
            'data_source': 'mock_data_for_testing',
            'risk_prediction_metadata': metadata
        }
    }
    
    # Save to file
    output_file = 'provinces_risk.json'
    print(f"\n4. Saving to {output_file}...")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved provinces GeoJSON to {output_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total provinces: {len(features)}")
        print(f"- Matched with risk data: {matched_count}")
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
            
        print(f"\nGenerated provinces.json with sample data!")
        print(f"You can now test the earthquake risk map.")
            
    except IOError as e:
        print(f"Error saving file: {e}")

if __name__ == "__main__":
    main()