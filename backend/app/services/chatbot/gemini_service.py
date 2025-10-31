# app/services/gemini_service.py
from google import genai
import os
from app.core.gemini import gemini


class GeminiService:
    def __init__(self):
        # Your earthquake context
        self.CONTEXT = """
        Magnitude 4.4 is the strongest for the last 24 hour
        Magnitude 6.2 is the strongest for the last 7 days
        """

        # Initialize chat session (shared for all users)
        self.chat = gemini.chats.create(
            model="gemini-2.0-flash",
            history=[
                {
                    "role": "user", 
                    "parts": [{"text": self.CONTEXT + " Use this as context for all questions."}]
                },
                {
                    "role": "model", 
                    "parts": [{"text": "I understand the earthquake data. I'm ready to answer questions about seismic activity."}]
                }
            ]
        )


    async def get_chat_response(self, user_message: str, user_id: str | None = None) -> str:
        """Get response from Gemini chatbot"""
        try:
            response = self.chat.send_message(user_message)
            return response.text
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
        
# global instance
gemini_service = GeminiService()