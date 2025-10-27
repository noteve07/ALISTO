# app/main.py
from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.live.earthquakes.earthquake_scheduler import earthquake_scheduler
from app.services.live.volcanoes.volcano_scheduler import volcano_scheduler
from app.api.v1.routes import api_router

# COMMENTEDF FOR TESTING ENDPOINTS (To Fix: services blocking endpoint calls, make this pure async)
# @asynccontextmanager
# async def lifespan(app: FastAPI):

#     # start schedulers concurrently
#     asyncio.create_task(earthquake_scheduler.start_scheduler())
#     await asyncio.sleep(settings.VOLCANO_STARTUP_DELAY_SECONDS)
#     asyncio.create_task(volcano_scheduler.start_scheduler())
    
#     yield  # app runs here

#     print("🔄 Shutting down ALISTO API...")
#     await volcano_scheduler.stop_scheduler()
#     await earthquake_scheduler.stop_scheduler()


# create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    # lifespan=lifespan
)

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# root endpoint
@app.get("/")
def root():
    return {
        "message": "ALISTO API is running!",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "api_root": settings.API_V1_PREFIX,
            "health": f"GET {settings.API_V1_PREFIX}/health",
            "health_scraper": f"GET {settings.API_V1_PREFIX}/health/scraper",
            "earthquakes_latest": f"GET {settings.API_V1_PREFIX}/earthquakes/latest",
        },
    }