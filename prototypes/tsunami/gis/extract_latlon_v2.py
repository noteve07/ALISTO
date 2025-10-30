import csv
import json

# input csv file
input_file = 'latlon_boxes.csv'
output_file = 'bounds.geojson'

features = []

with open(input_file, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        north = float(row['north'])
        south = float(row['south'])
        east = float(row['east'])
        west = float(row['west'])

        # define polygon coordinates (clockwise)
        coordinates = [[
            [west, north],
            [east, north],
            [east, south],
            [west, south],
            [west, north]
        ]]

        # make a geojson feature
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": coordinates
            },
            "properties": {}
        })

# create geojson
geojson_data = {
    "type": "FeatureCollection",
    "features": features
}

# save to file
with open(output_file, 'w') as f:
    json.dump(geojson_data, f, indent=2)

print(f"✅ saved to {output_file}")
