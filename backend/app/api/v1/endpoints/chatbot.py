"""Endpoints for receiving chatbot messages and sending response to user"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import os
from statistics import mean

from app.core.config import settings
from app.core.database import supabase

from app.services.chatbot.gemini_service import gemini_service


router = APIRouter(prefix="/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None  

class ChatResponse(BaseModel):
    response: str
    success: bool



@router.post("/send", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """
    Send a message to the earthquake chatbot and get response
    """
    try:
        # get response from gemini
        bot_response = await gemini_service.get_chat_response(request.message, request.user_id)

        # return response to user
        return ChatResponse(
            response=bot_response,
            success=True
        )
    except  Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/latest-earthquakes")
async def get_latest_earthquakes_summary(
    hours: int = Query(
        default=24,
        ge=1,
        description="Number of hours to look back from now",
    ),
):
    """
    Get latest earthquakes summary for chatbot with count, average magnitude, and highest magnitude
    """
    try:
        # Load province lookup data
        lookup_file_path = os.path.join(os.path.dirname(__file__), "../../../src/lookup/provinces_id.json")
        with open(lookup_file_path, 'r') as f:
            provinces_lookup = json.load(f)
        
        # Create reverse lookup for province IDs to names
        province_id_to_name = {v: k for k, v in provinces_lookup.items()}
        
        # Calculate time window
        now = datetime.now()
        start_time = now - timedelta(hours=hours)
        start_iso = start_time.isoformat()

        # Query earthquakes from database
        query = (
            supabase.table("latest_earthquakes")
            .select("datetime, magnitude, depth, province_id, location")
            .gte("datetime", start_iso)
            .order("datetime", desc=True)
        )

        result = query.execute()
        earthquakes = result.data if result.data else []

        if not earthquakes:
            return {
                "success": True,
                "earthquakes_last_24_hours": {
                    "count": 0,
                    "average_magnitude": 0,
                    "highest_magnitude": 0,
                    "data": []
                }
            }

        # Process earthquake data
        processed_earthquakes = []
        magnitudes = []
        
        for eq in earthquakes:
            # Get province name from lookup
            province_name = province_id_to_name.get(eq.get('province_id'), 'Unknown')
            # Use the location column directly
            location = eq.get('location', province_name.title())

            processed_eq = {
                "datetime": eq.get('datetime'),
                "magnitude": eq.get('magnitude'),
                "depth": eq.get('depth'),
                "province": province_name.title(),
                "location": location
            }

            processed_earthquakes.append(processed_eq)

            # Collect magnitudes for calculations
            if eq.get('magnitude'):
                magnitudes.append(float(eq.get('magnitude')))

        # Calculate statistics
        count = len(earthquakes)
        average_magnitude = round(mean(magnitudes), 2) if magnitudes else 0
        highest_magnitude = max(magnitudes) if magnitudes else 0

        return {
            "success": True,
            "earthquakes_last_24_hours": {
                "count": count,
                "average_magnitude": average_magnitude,
                "highest_magnitude": highest_magnitude,
                "data": processed_earthquakes
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "earthquakes_last_24_hours": {
                "count": 0,
                "average_magnitude": 0,
                "highest_magnitude": 0,
                "data": []
            }
        }



