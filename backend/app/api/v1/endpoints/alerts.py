from fastapi import APIRouter
import asyncio

router = APIRouter(prefix="/alerts", tags=["Alerts"])
flag = False
reset_task = None

@router.get("/listen")
async def get_latest_earthquakes():
    """Return the current alert flag state."""
    return {
        "success": True,
        "alert": flag,
    }


async def reset_flag_after_delay(delay=10):
    global flag
    await asyncio.sleep(delay)
    flag = False

@router.post("/trigger")
async def trigger_alert(alert: bool = True):
    """Set the alert flag to True or False."""
    global flag, reset_task
    flag = alert
    if alert:
        if reset_task is not None and not reset_task.done():
            reset_task.cancel()
        reset_task = asyncio.create_task(reset_flag_after_delay())
    return {"success": True, "alert": flag}