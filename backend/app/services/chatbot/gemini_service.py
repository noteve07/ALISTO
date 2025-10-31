# app/services/gemini_service.py
from app.core.gemini import gemini
from app.services.chatbot.context_manager import context_manager


class GeminiService:
    def __init__(self):
        pass

    async def get_chat_response(self, user_message: str, user_id: str | None = None) -> str:
        """Get response from Gemini chatbot with master context"""
        try:
            # Get master context (compiled from all context files)
            context = context_manager.get_master_context()
            
            # Generate response using generate_content
            response = gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{context}\n\nUSER: {user_message}"
            )
            
            return response.text
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
        
# global instance
gemini_service = GeminiService()