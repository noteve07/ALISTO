# app/models/__init__.py
from .earthquake import EarthquakeData
from .volcano import VolcanoAdvisoryData, VolcanoRawAdvisory
from .province import (
    Province, 
    ProvinceCreate, 
    ProvinceUpdate, 
    ProvinceInDB, 
    ProvinceSimple,
    ProvinceWithStats
)

__all__ = [
    "EarthquakeData",
    "Province",
    "ProvinceCreate",
    "ProvinceUpdate", 
    "ProvinceInDB",
    "ProvinceSimple",
    "ProvinceWithStats",
    "VolcanoAdvisoryData",
    "VolcanoRawAdvisory",
]