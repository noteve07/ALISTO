# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes import api_router
from app.services.live.earthquakes.earthquake_scheduler import earthquake_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start earthquake scheduler
    print("🚀 Starting ALISTO API...")
    await earthquake_scheduler.start_scheduler()
    
    yield  # App is running
    
    # shutdown earthquake scheduler
    print("🔄 Shutting down ALISTO API...")
    await earthquake_scheduler.stop_scheduler()


# create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
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
        "endpoints": {
            "Live Earthquakes": f"GET {settings.API_V1_PREFIX}/earthquakes/live",
            "Test Scraping": f"GET {settings.API_V1_PREFIX}/earthquakes/test",
        }
    }