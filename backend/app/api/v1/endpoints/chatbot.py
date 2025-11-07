"""Endpoints for receiving chatbot messages and sending response to user"""
from fastapi import APIRouter, HTTPException

from app.models.chatbot import ChatRequest, ChatResponse
from app.services.chatbot.gemini_service import gemini_service
from app.services.chatbot.context_manager import context_manager
from app.services.chatbot.conversation_history import conversation_history


router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("/send", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """
    Send a message to the earthquake chatbot and get response
    """
    try:
        # Get response from gemini service (which now uses master context)
        bot_response = await gemini_service.get_chat_response(request.message, request.user_id)

        # Return response to user
        return ChatResponse(
            response=bot_response,
            success=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/update-context")
async def update_context():
    """
    Manually trigger context update (for testing/admin purposes)
    """
    try:
        print("=== Starting manual context update ===")
        success = await context_manager.update_all_contexts()
        print(f"=== Context update completed: {success} ===")
        return {
            "success": success,
            "message": "Context updated successfully" if success else "Failed to update context"
        }
    except Exception as e:
        print(f"=== Context update error: {str(e)} ===")
        raise HTTPException(status_code=500, detail=f"Context update error: {str(e)}")


@router.get("/context")
async def get_current_context():
    """
    Get the current master context (for debugging purposes)
    """
    try:
        context = context_manager.get_master_context()
        return {
            "success": True,
            "context": context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context retrieval error: {str(e)}")


@router.get("/history/{user_id}")
async def get_conversation_history(user_id: str):
    """
    Get conversation history for a specific user (for debugging purposes)
    """
    try:
        history = conversation_history.get_history(user_id)
        return {
            "success": True,
            "user_id": user_id,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval error: {str(e)}")


@router.delete("/history/{user_id}")
async def clear_user_conversation_history(user_id: str):
    """
    Clear conversation history for a specific user
    """
    try:
        conversation_history.clear_history(user_id)
        return {
            "success": True,
            "message": f"Conversation history cleared for user: {user_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History clearing error: {str(e)}")


@router.delete("/history")
async def clear_all_conversation_histories():
    """
    Clear all conversation histories
    """
    try:
        conversation_history.clear_all_histories()
        return {
            "success": True,
            "message": "All conversation histories cleared"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History clearing error: {str(e)}")


@router.get("/history-stats")
async def get_conversation_stats():
    """
    Get statistics about current conversations
    """
    try:
        stats = conversation_history.get_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats retrieval error: {str(e)}")


@router.post("/cleanup-histories")
async def cleanup_old_histories():
    """
    Manually trigger cleanup of old conversation histories
    """
    try:
        conversation_history.cleanup_all_old_messages()
        stats = conversation_history.get_stats()
        return {
            "success": True,
            "message": "Old conversation histories cleaned up",
            "remaining_stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup error: {str(e)}")



