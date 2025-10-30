# small-letter comments only
import zipfile
import xml.etree.ElementTree as ET
import csv
import sys
from pathlib import Path

# usage: python extract_kmz_coords.py path/to/file.kmz output.csv

kmz_path = Path(sys.argv[1])
out_csv = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("coords_output.csv")

# unzip kmz and read kml file (commonly doc.kml)
with zipfile.ZipFile(kmz_path, 'r') as z:
    # find first .kml inside
    kml_names = [name for name in z.namelist() if name.lower().endswith('.kml')]
    if not kml_names:
        raise SystemExit("no .kml found inside kmz")
    kml_data = z.read(kml_names[0])

# parse kml xml
root = ET.fromstring(kml_data)

# kml uses namespace sometimes, try to detect default namespace
ns = {}
if root.tag.startswith('{'):
    uri = root.tag.split('}')[0].strip('{')
    ns = {'k': uri}
    coord_xpath = './/k:coordinates'
    geom_xpath = './/k:Point|.//k:LineString|.//k:Polygon'
else:
    coord_xpath = './/coordinates'
    geom_xpath = './/Point|.//LineString|.//Polygon'

rows = []
# iterate geometry elements and extract coordinate text
for geom in root.findall(geom_xpath, ns):
    tag = geom.tag.split('}')[-1]
    # point may have <coordinates> directly, polygon/linestring also
    coords_el = geom.find(coord_xpath, ns)
    if coords_el is None:
        # polygon may nest coordinates inside outerBoundaryIs/LinearRing
        coords_el = geom.find('.//k:coordinates', ns) if ns else geom.find('.//coordinates')
    if coords_el is None:
        continue
    raw = coords_el.text.strip()
    # coordinates are space/newline separated. each = lon,lat[,alt]
    parts = raw.replace('\n', ' ').split()
    for p in parts:
        comps = p.split(',')
        if len(comps) < 2:
            continue
        lon = comps[0]
        lat = comps[1]
        alt = comps[2] if len(comps) > 2 else ''
        rows.append((tag, lon, lat, alt))

# write to csv
with out_csv.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['geometry', 'lon', 'lat', 'alt'])
    writer.writerows(rows)

print(f"wrote {len(rows)} coordinates to {out_csv}")