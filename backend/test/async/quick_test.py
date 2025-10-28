#!/usr/bin/env python3
"""
Quick test to check if API is responsive during sync operations.
Run this while your FastAPI server is running.
"""

import requests
import time
import threading
from datetime import datetime

API_BASE_URL = "http://127.0.0.1:8000"

def test_endpoint_continuously():
    """Continuously test API endpoints."""
    print(f"🚀 Starting continuous API test at {datetime.now()}")
    print("Testing endpoints every 0.5 seconds for 30 seconds...")
    print("=" * 50)
    
    endpoints = ["/", "/api/v1/health", "/api/v1/earthquakes/latest", "/api/v1/dashboard"]
    start_time = time.time()
    test_count = 0
    
    while time.time() - start_time < 30:  # Test for 30 seconds
        for endpoint in endpoints:
            try:
                start_req = time.time()
                response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
                end_req = time.time()
                response_time = end_req - start_req
                
                status = "✅" if response.status_code in [200, 404] else "❌"
                print(f"{status} {endpoint}: {response_time:.3f}s (Status: {response.status_code})")
                
                if response_time > 5.0:
                    print(f"⚠️  SLOW RESPONSE: {endpoint} took {response_time:.3f}s - POSSIBLE BLOCKING!")
                
            except requests.exceptions.Timeout:
                print(f"❌ {endpoint}: TIMEOUT - BLOCKING DETECTED!")
            except Exception as e:
                print(f"❌ {endpoint}: ERROR - {str(e)}")
        
        test_count += 1
        time.sleep(0.5)  # Wait 0.5 seconds between tests
        
        # Progress update every 10 seconds
        elapsed = time.time() - start_time
        if int(elapsed) % 10 == 0 and elapsed > 0:
            print(f"📊 {elapsed:.0f}s elapsed, {test_count} test rounds completed")
    
    print(f"\n🎯 Test completed! Ran {test_count} test rounds in 30 seconds.")
    print("If you saw consistent fast responses (<1s), the blocking issue is fixed! ✅")
    print("If you saw timeouts or slow responses (>5s), blocking still exists. ❌")

if __name__ == "__main__":
    print("🧪 Quick API Blocking Test")
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    input("Press Enter to start the test...")
    
    test_endpoint_continuously()
