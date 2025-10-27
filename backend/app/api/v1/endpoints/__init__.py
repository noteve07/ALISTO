"""API endpoint modules for version 1."""

from . import earthquakes
from . import health
from . import volcanoes

__all__ = [
    "earthquakes",
    "health",
    "volcanoes",
]
