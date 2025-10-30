# extract_latlonbox.py
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import csv

kmz_path = Path("tsunami.kmz")

with zipfile.ZipFile(kmz_path, "r") as z:
    kml_name = [f for f in z.namelist() if f.endswith(".kml")][0]
    data = z.read(kml_name)

root = ET.fromstring(data)
ns = {'k': 'http://www.opengis.net/kml/2.2', 'gx': 'http://www.google.com/kml/ext/2.2'}

rows = []
for box in root.findall(".//k:LatLonBox", ns):
    north = box.findtext("k:north", namespaces=ns)
    south = box.findtext("k:south", namespaces=ns)
    east = box.findtext("k:east", namespaces=ns)
    west = box.findtext("k:west", namespaces=ns)
    rows.append((north, south, east, west))

with open("latlon_boxes.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["north", "south", "east", "west"])
    writer.writerows(rows)

print(f"wrote {len(rows)} bounding boxes to latlon_boxes.csv")
