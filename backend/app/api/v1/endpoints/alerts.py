from fastapi import APIRouter


router = APIRouter(prefix="/alerts", tags=["Alerts"])
flag = False

@router.get("/listen")
async def get_latest_earthquakes():
    """Return the current alert flag state."""
    return {
        "success": True,
        "alert": flag,
    }


@router.post("/trigger")
async def trigger_alert(alert: bool = True):
    """Set the alert flag to True or False."""
    global flag
    flag = alert
    return {
        "success": True,
        "message": f"Alert flag set to {flag}.",
        "alert": flag,
    }