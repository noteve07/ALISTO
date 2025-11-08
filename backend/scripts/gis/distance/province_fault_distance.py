import json
import os
from typing import List, Tuple, Optional

from shapely.geometry import Polygon, MultiPolygon, shape, LineString, MultiLineString
from shapely.ops import unary_union, transform
from pyproj import Transformer


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
PROVINCE_BOUNDARIES_PATH = os.path.join(THIS_DIR, "province_boundaries.json")
FAULT_LINES_PATH = os.path.join(THIS_DIR, "fault_lines.geojson")
OUTPUT_PATH = os.path.join(THIS_DIR, "province_fault_distance.json")


def _clean_ring(ring: List[List[float]]) -> List[Tuple[float, float]]:
    """Convert a ring [[lon, lat], ...] to list[tuple] and drop invalid points."""
    cleaned = []
    for pt in ring or []:
        if not isinstance(pt, (list, tuple)) or len(pt) < 2:
            continue
        x, y = pt[0], pt[1]
        if isinstance(x, (int, float)) and isinstance(y, (int, float)):
            cleaned.append((float(x), float(y)))
    # Keep only if there are at least 3 vertices (shapely will close ring if needed)
    return cleaned if len(cleaned) >= 3 else []


def _build_polygon_from_rings(rings: List[List[List[float]]]) -> Optional[Polygon]:
    """Build a shapely Polygon from rings array: [ring(points), ...]."""
    if not isinstance(rings, list) or len(rings) == 0:
        return None
    cleaned_rings = [r for r in (_clean_ring(r) for r in rings) if r]
    if not cleaned_rings:
        return None
    shell = cleaned_rings[0]
    holes = cleaned_rings[1:] if len(cleaned_rings) > 1 else []
    try:
        poly = Polygon(shell, holes)
        # Ensure valid polygon
        if not poly.is_valid:
            poly = poly.buffer(0)
        return poly if not poly.is_empty else None
    except Exception:
        return None


def _is_multipolygon(boundary: list) -> Optional[bool]:
    """Heuristic to detect if boundary looks like MultiPolygon structure.
    MultiPolygon: [ [ [ [x,y], ... ] (ring), ... ] (polygon), ... ]
    Polygon:      [ [ [x,y], ... ] (ring), ... ]
    Returns True for MultiPolygon, False for Polygon, None if undetermined.
    """
    try:
        sample = boundary
        # Peel empty arrays to reach a representative branch
        for _ in range(4):
            if isinstance(sample, list) and len(sample) > 0:
                sample = sample[0]
            else:
                break
        # Now sample can be: number, [x,y], ring, etc.
        # If at this level we still have list (likely a point [x,y]), then
        # looking two levels up helps:
        # For MultiPolygon, boundary[0][0][0] is a point [x,y] (list)
        # For Polygon, boundary[0][0][0] is a number (x)
        def safe_get(arr, idx_chain):
            cur = arr
            for i in idx_chain:
                if isinstance(cur, list) and len(cur) > i:
                    cur = cur[i]
                else:
                    return None
            return cur
        v = safe_get(boundary, [0, 0, 0])
        if isinstance(v, list):
            return True
        if isinstance(v, (int, float)):
            return False
        return None
    except Exception:
        return None


def boundary_to_geometry(boundary: list) -> Optional[MultiPolygon | Polygon]:
    """Convert boundary nested arrays to a shapely (Multi)Polygon in lon/lat."""
    if not isinstance(boundary, list) or len(boundary) == 0:
        return None

    is_multi = _is_multipolygon(boundary)

    # Try MultiPolygon path
    if is_multi is True or is_multi is None:
        polygons: List[Polygon] = []
        for poly_rings in boundary:
            if not isinstance(poly_rings, list):
                continue
            poly = _build_polygon_from_rings(poly_rings)
            if poly is not None and not poly.is_empty:
                polygons.append(poly)
        if len(polygons) == 1:
            return polygons[0]
        if len(polygons) > 1:
            try:
                mp = MultiPolygon(polygons)
                if not mp.is_valid:
                    mp = mp.buffer(0)
                if not mp.is_empty:
                    return mp
            except Exception:
                pass
        # If Multi path failed and we were unsure, fall back to Polygon path
        if is_multi is True:
            return None

    # Try Polygon path
    poly = _build_polygon_from_rings(boundary)
    return poly


def load_fault_lines(geojson_path: str) -> Optional[LineString | MultiLineString]:
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    features = data.get("features", [])
    line_geoms = []
    for feat in features:
        geom = feat.get("geometry") if isinstance(feat, dict) else None
        if not geom or not geom.get("type") or not geom.get("coordinates"):
            continue
        try:
            shp = shape(geom)
            if shp.is_empty:
                continue
            if shp.geom_type in ("LineString", "MultiLineString"):
                line_geoms.append(shp)
            # Some datasets may include Polygons; extract their boundaries if present
            elif shp.geom_type in ("Polygon", "MultiPolygon"):
                line_geoms.append(shp.boundary)
        except Exception:
            continue
    if not line_geoms:
        return None
    try:
        merged = unary_union(line_geoms)
        return merged
    except Exception:
        # Fallback: combine as MultiLineString if possible
        try:
            lines = []
            for g in line_geoms:
                if isinstance(g, LineString):
                    lines.append(g)
                elif isinstance(g, MultiLineString):
                    lines.extend(list(g.geoms))
            return MultiLineString(lines) if lines else None
        except Exception:
            return None


def compute_distances(provinces: List[dict], faults_geom) -> List[dict]:
    """Compute nearest fault-line distance for each province in kilometers."""
    # Project from WGS84 to Web Mercator (meters)
    transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    project = lambda geom: transform(transformer.transform, geom)

    if faults_geom is None or faults_geom.is_empty:
        raise RuntimeError("Fault lines geometry is empty or invalid.")

    faults_proj = project(faults_geom)

    results = []
    for prov in provinces:
        pid = prov.get("province_id")
        pname = prov.get("province_name") or prov.get("name")
        boundary = prov.get("boundary")

        entry = {
            "province_id": pid,
            "province_name": pname,
            "nearest_fault_distance_km": None,
        }

        geom = boundary_to_geometry(boundary)
        if geom is None or geom.is_empty:
            results.append(entry)
            continue

        geom_proj = project(geom)
        try:
            dist_m = geom_proj.distance(faults_proj)
            dist_km = dist_m / 1000.0
            entry["nearest_fault_distance_km"] = round(dist_km, 3)
        except Exception:
            # Leave as None if distance fails
            pass

        results.append(entry)
    return results


def main():
    # Load inputs
    if not os.path.exists(PROVINCE_BOUNDARIES_PATH):
        raise FileNotFoundError(f"Missing province boundaries file: {PROVINCE_BOUNDARIES_PATH}")
    if not os.path.exists(FAULT_LINES_PATH):
        raise FileNotFoundError(f"Missing fault lines file: {FAULT_LINES_PATH}")

    with open(PROVINCE_BOUNDARIES_PATH, "r", encoding="utf-8") as f:
        provinces = json.load(f)

    faults_geom = load_fault_lines(FAULT_LINES_PATH)

    results = compute_distances(provinces, faults_geom)

    # Save output
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Wrote nearest-fault distances for {len(results)} provinces to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
