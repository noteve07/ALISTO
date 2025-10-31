"""Endpoints for receiving chatbot messages and sending response to user"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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



