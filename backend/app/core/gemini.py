from google import genai
from app.core.config import settings

def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY must be set in environment variables")
    
    return genai.Client(api_key=settings.GEMINI_API_KEY)

# global gemini client instance
gemini = get_gemini_client()