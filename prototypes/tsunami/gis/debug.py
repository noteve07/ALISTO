import zipfile
from pathlib import Path

kmz_path = Path("tsunami.kmz")

with zipfile.ZipFile(kmz_path, 'r') as z:
    kml_files = [f for f in z.namelist() if f.endswith('.kml')]
    print("KML files inside KMZ:", kml_files)
    if kml_files:
        print("\nFirst 50 lines of the KML content:\n")
        data = z.read(kml_files[0]).decode('utf-8', errors='ignore')
        for i, line in enumerate(data.splitlines()[:50]):
            print(f"{i+1:02d}: {line}")
