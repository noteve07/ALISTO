"""Quick test to check if master context service can read earthquakes.txt"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.services.chatbot.master_context_service import master_context_service

# Test reading earthquakes.txt
earthquakes = master_context_service._read_context_file("earthquakes.txt")
print("Earthquakes content length:", len(earthquakes))
print("First 200 chars:", earthquakes[:200])

# Test full compilation
context = master_context_service.compile_master_context()
print("\nMaster context compiled successfully")
print("Context length:", len(context))