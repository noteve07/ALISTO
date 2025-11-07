# app/services/gemini_service.py
from app.core.gemini import gemini
from app.services.chatbot.context_manager import context_manager
from app.services.chatbot.conversation_history import conversation_history


class GeminiService:
    def __init__(self):
        pass

    async def get_chat_response(self, user_message: str, user_id: str | None = None) -> str:
        """Get response from Gemini chatbot with master context and conversation history"""
        try:
            # Get master context (compiled from all context files)
            context = context_manager.get_master_context()
            
            # Get conversation history for this user
            history = conversation_history.get_history(user_id or "anonymous")
            
            # Build the complete prompt with context, history, and current message
            if history:
                contents = f"CONTEXT: {context}\n\nHISTORY:\n{history}\n\nUSER: {user_message}"
            else:
                contents = f"CONTEXT: {context}\n\nUSER: {user_message}"
            
            # Generate response using generate_content
            response = gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=contents
            )
            
            bot_response = response.text
            
            # Add this conversation to history for future context
            conversation_history.add_message(
                user_id or "anonymous", 
                user_message, 
                bot_response
            )
            
            return bot_response
            
        except Exception as e:
            error_message = f"Sorry, I encountered an error: {str(e)}"
            # Still add error responses to history for context
            conversation_history.add_message(
                user_id or "anonymous", 
                user_message, 
                error_message
            )
            return error_message
        
# global instance
gemini_service = GeminiService()