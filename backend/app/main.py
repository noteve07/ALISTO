# app/main.py
from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.live.earthquakes.earthquake_scheduler import earthquake_scheduler
from app.services.live.volcanoes.volcano_scheduler import volcano_scheduler
from app.services.chatbot.conversation_history import conversation_history
from app.api.v1.routes import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting ALISTO API...")
    
    # Start earthquake scheduler immediately (non-blocking)
    asyncio.create_task(earthquake_scheduler.start_scheduler())
    
    # Start volcano scheduler after delay (non-blocking)
    async def start_volcano_scheduler():
        await asyncio.sleep(settings.VOLCANO_STARTUP_DELAY_SECONDS)
        await volcano_scheduler.start_scheduler()
    
    asyncio.create_task(start_volcano_scheduler())
    
    # Optional: Trigger first earthquake sync immediately but non-blocking
    async def trigger_first_earthquake_sync():
        await asyncio.sleep(2)  # Small delay to ensure scheduler is ready
        await earthquake_scheduler.earthquake_sync_job()
    
    asyncio.create_task(trigger_first_earthquake_sync())
    
    # Start conversation history cleanup task (every 10 minutes)
    async def conversation_cleanup_task():
        while True:
            await asyncio.sleep(600)  # 10 minutes
            try:
                conversation_history.cleanup_all_old_messages()
                stats = conversation_history.get_stats()
                print(f"🧹 Cleaned up conversation histories. Remaining: {stats}")
            except Exception as e:
                print(f"❌ Error during conversation cleanup: {e}")
    
    asyncio.create_task(conversation_cleanup_task())
    
    yield  # App is running
    
    print("🔄 Shutting down ALISTO API...")
    await volcano_scheduler.stop_scheduler()
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
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "api_root": settings.API_V1_PREFIX,
            "health": f"GET {settings.API_V1_PREFIX}/health",
            "health_scraper": f"GET {settings.API_V1_PREFIX}/health/scraper",
            "earthquakes_latest": f"GET {settings.API_V1_PREFIX}/earthquakes/latest",
        },
    }