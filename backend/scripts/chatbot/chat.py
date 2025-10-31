from google import genai
from dotenv import load_dotenv
import os
import requests
import json

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API"))

# Fetch earthquake data
def get_earthquakes():
    try:
        response = requests.get("http://127.0.0.1:8000/api/v1/earthquakes/latest")
        return response.json()
    except:
        return None

print("📡 Fetching latest earthquakes...")
data = get_earthquakes()

if data:
    print(f"✅ Found {len(data) if isinstance(data, list) else 'some'} earthquakes")
    earthquake_info = json.dumps(data, indent=2)
else:
    earthquake_info = "No earthquake data available"
    print("❌ Could not fetch earthquake data")

# Create earthquake expert
chat = client.chats.create(
    model="gemini-2.0-flash",
    history=[
        {
            "role": "user", 
            "parts": [{"text": f"Your name is ISA (Intelligent Seismic Assistant), an assistant chatbot for ALISTO (Automated Live Information for Seismic Tracking and Observation). You will assist user in information dissemination, alerts, awareness and disaster response and preparedness. Latest earthquake data: {earthquake_info}. Use this real-time data to answer questions."}]
        },
        {
            "role": "model", 
            "parts": [{"text": "I have the latest earthquake data from the past 24 hours. I can tell you about recent seismic activity, magnitudes, locations, and patterns. What would you like to know?"}]
        }
    ]
)

print("\n🌍 ISA Chatbot: Ask me about recent earthquakes!")
print("Type 'exit' to quit\n")

while True:
    question = input("You: ")
    if question.lower() == 'exit':
        break
    
    try:
        response = chat.send_message(question)
        print(f"ISA: {response.text}\n")
    except Exception as e:
        print(f"Error: {e}\n")

print("Goodbye! 👋")