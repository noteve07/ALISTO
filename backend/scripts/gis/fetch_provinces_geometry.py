import os
import json
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ProvinceGeometryFetcher:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        self.supabase: Client = None
        
    def init_supabase(self):
        """Initialize Supabase client"""
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.supabase = create_client(self.supabase_url, self.supabase_key)
    
    def parse_geometry_wkt(self, geometry_data):
        """
        Parse geometry data - handles both WKT strings and GeoJSON/dict objects
        Handles POLYGON, MULTIPOLYGON, and POINT types
        """
        if not geometry_data:
            return None
        
        try:
            # If it's already a dict (GeoJSON from PostGIS), extract coordinates
            if isinstance(geometry_data, dict):
                return geometry_data.get('coordinates')
            
            # If it's a string, parse as WKT
            if isinstance(geometry_data, str):
                if geometry_data.startswith('POLYGON'):
                    return self._parse_polygon(geometry_data)
                elif geometry_data.startswith('MULTIPOLYGON'):
                    return self._parse_multipolygon(geometry_data)
                elif geometry_data.startswith('POINT'):
                    return self._parse_point(geometry_data)
                else:
                    print(f"Unsupported geometry type: {geometry_data.split('(')[0]}")
                    return None
            
            return None
        except Exception as e:
            print(f"Error parsing geometry: {e}")
            return None
    
    def _parse_point(self, wkt_string):
        """Parse POINT geometry"""
        # Extract coordinates between parentheses
        coords_str = wkt_string.split('(')[-1].rstrip(')')
        coords = [float(coord.strip()) for coord in coords_str.split()]
        return coords
    
    def _parse_polygon(self, wkt_string):
        """Parse POLYGON geometry"""
        # Extract coordinates between parentheses
        coords_str = wkt_string.split('((')[-1].rstrip('))')
        rings = coords_str.split('),(')
        
        coordinates = []
        for ring in rings:
            ring_coords = []
            points = ring.split(',')
            for point in points:
                coords = [float(coord.strip()) for coord in point.split()]
                ring_coords.append(coords)
            coordinates.append(ring_coords)
        
        return coordinates
    
    def _parse_multipolygon(self, wkt_string):
        """Parse MULTIPOLYGON geometry"""
        # Extract coordinates between parentheses
        coords_str = wkt_string.split('(((')[-1].rstrip(')))')
        polygons = coords_str.split(')),((')
        
        coordinates = []
        for polygon in polygons:
            rings = polygon.split('),(')
            polygon_coords = []
            
            for ring in rings:
                ring_coords = []
                points = ring.split(',')
                for point in points:
                    coords = [float(coord.strip()) for coord in point.split()]
                    ring_coords.append(coords)
                polygon_coords.append(ring_coords)
            
            coordinates.append(polygon_coords)
        
        return coordinates
    
    def fetch_provinces(self):
        """Fetch all provinces from Supabase"""
        try:
            response = self.supabase.table('provinces').select('*').execute()
            
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Supabase error: {response.error}")
            
            return response.data
        except Exception as e:
            print(f"Error fetching provinces: {e}")
            return []
    
    def process_provinces(self, provinces_data):
        """Process provinces data to extract geometry coordinates"""
        processed_provinces = []
        
        for province in provinces_data:
            try:
                province_id = province.get('province_id')
                province_name = province.get('name')
                boundaries_wkt = province.get('boundaries')
                centroid_wkt = province.get('centroid')
                
                # Parse geometries
                boundary_coords = self.parse_geometry_wkt(boundaries_wkt) if boundaries_wkt else None
                centroid_coords = self.parse_geometry_wkt(centroid_wkt) if centroid_wkt else None
                
                processed_province = {
                    'province_id': province_id,
                    'province_name': province_name,
                    'boundary': boundary_coords,
                    'centroid': centroid_coords
                }
                
                processed_provinces.append(processed_province)
                print(f"Processed province: {province_name} (ID: {province_id})")
                
            except Exception as e:
                print(f"Error processing province {province.get('province_id')}: {e}")
                continue
        
        return processed_provinces
    
    def save_to_json(self, data, filename='province_geometry.json'):
        """Save processed data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Data successfully saved to {filename}")
        except Exception as e:
            print(f"Error saving to JSON: {e}")
    
    def run(self):
        """Main execution function"""
        try:
            # Initialize Supabase client
            self.init_supabase()
            print("Supabase client initialized")
            
            # Fetch provinces data
            print("Fetching provinces data...")
            provinces_data = self.fetch_provinces()
            print(f"Fetched {len(provinces_data)} provinces")
            
            if not provinces_data:
                print("No provinces data found")
                return
            
            # Process geometries
            print("Processing geometries...")
            processed_data = self.process_provinces(provinces_data)
            print(f"Successfully processed {len(processed_data)} provinces")
            
            # Save to JSON
            self.save_to_json(processed_data)
            
        except Exception as e:
            print(f"Error in main execution: {e}")

def main():
    """Main function"""
    fetcher = ProvinceGeometryFetcher()
    fetcher.run()

if __name__ == "__main__":
    main()