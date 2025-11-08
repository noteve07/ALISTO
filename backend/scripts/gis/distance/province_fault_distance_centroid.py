import json
import os
from typing import List, Optional

from shapely.geometry import Point, shape, LineString, MultiLineString
from shapely.ops import unary_union, transform
from pyproj import Transformer

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
PROVINCE_GEOMETRY_PATH = os.path.join(THIS_DIR, "province_geometry.json")
FAULT_LINES_PATH = os.path.join(THIS_DIR, "fault_lines.geojson")
OUTPUT_PATH = os.path.join(THIS_DIR, "province_fault_distance_centroid.json")


def load_fault_lines(geojson_path: str) -> Optional[LineString | MultiLineString]:
    """Load fault line geometries (LineString / MultiLineString). Polygons are converted to boundaries."""
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    features = data.get("features", [])
    line_geoms = []
    for feat in features:
        if not isinstance(feat, dict):
            continue
        geom = feat.get("geometry")
        if not geom or not geom.get("type") or geom.get("coordinates") in (None, [], {}):
            continue
        try:
            shp = shape(geom)
        except Exception:
            continue
        if shp.is_empty:
            continue
        gt = shp.geom_type
        if gt in ("LineString", "MultiLineString"):
            line_geoms.append(shp)
        elif gt in ("Polygon", "MultiPolygon"):
            line_geoms.append(shp.boundary)
    if not line_geoms:
        return None
    try:
        merged = unary_union(line_geoms)
        return merged
    except Exception:
        # Fallback simple multi merge
        lines: List[LineString] = []
        for g in line_geoms:
            if isinstance(g, LineString):
                lines.append(g)
            elif isinstance(g, MultiLineString):
                lines.extend(list(g.geoms))
        return MultiLineString(lines) if lines else None


def compute_centroid_distances(provinces: List[dict], faults_geom) -> List[dict]:
    """Compute nearest fault line distance for each province using centroid only.
    Distances are returned in kilometers (projecting lon/lat to Web Mercator EPSG:3857).
    """
    transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    project = lambda geom: transform(transformer.transform, geom)

    if faults_geom is None or faults_geom.is_empty:
        raise RuntimeError("Fault lines geometry is empty or invalid.")
    faults_proj = project(faults_geom)

    results = []
    for prov in provinces:
        pid = prov.get("province_id")
        pname = prov.get("province_name") or prov.get("name")
        centroid = prov.get("centroid")

        entry = {
            "province_id": pid,
            "province_name": pname,
            "nearest_fault_distance_km": None,
        }

        # Centroid expected as [lon, lat]
        if not (isinstance(centroid, list) and len(centroid) >= 2 and all(isinstance(c, (int, float)) for c in centroid[:2])):
            results.append(entry)
            continue

        pt = Point(float(centroid[0]), float(centroid[1]))
        pt_proj = project(pt)
        try:
            dist_m = pt_proj.distance(faults_proj)
            entry["nearest_fault_distance_km"] = round(dist_m / 1000.0, 3)
        except Exception:
            pass
        results.append(entry)
    return results


def main():
    if not os.path.exists(PROVINCE_GEOMETRY_PATH):
        raise FileNotFoundError(f"Missing province geometry file: {PROVINCE_GEOMETRY_PATH}")
    if not os.path.exists(FAULT_LINES_PATH):
        raise FileNotFoundError(f"Missing fault lines file: {FAULT_LINES_PATH}")

    with open(PROVINCE_GEOMETRY_PATH, "r", encoding="utf-8") as f:
        provinces = json.load(f)

    faults_geom = load_fault_lines(FAULT_LINES_PATH)
    results = compute_centroid_distances(provinces, faults_geom)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Wrote centroid-based nearest-fault distances for {len(results)} provinces to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
