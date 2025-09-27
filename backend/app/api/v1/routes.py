from fastapi import APIRouter
from .endpoints import earthquakes
from .endpoints import health

api_router = APIRouter()

api_router.include_router(earthquakes.router, tags=["Earthquakes"])
api_router.include_router(health.router, tags=["Health"])