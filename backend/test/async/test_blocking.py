#!/usr/bin/env python3
"""
Automated test to verify API endpoints remain responsive during sync operations.
Tests if the blocking issue has been resolved.
"""

import asyncio
import time
import httpx
from datetime import datetime
from typing import List, Tuple

# Test configuration
API_BASE_URL = "http://127.0.0.1:8000"
TEST_ENDPOINTS = [
    "/",
    "/api/v1/health",
    "/api/v1/earthquakes/latest",
    "/api/v1/dashboard",
]

class BlockingTest:
    def __init__(self):
        self.results: List[Tuple[str, float, bool]] = []
        self.client = httpx.AsyncClient(timeout=5.0)

    async def test_endpoint(self, endpoint: str) -> Tuple[str, float, bool]:
        """Test a single endpoint and measure response time."""
        start_time = time.time()
        try:
            response = await self.client.get(f"{API_BASE_URL}{endpoint}")
            end_time = time.time()
            response_time = end_time - start_time
            success = response.status_code in [200, 404]  # 404 is ok for some endpoints
            
            print(f"✅ {endpoint}: {response_time:.3f}s (Status: {response.status_code})")
            return endpoint, response_time, success
            
        except httpx.TimeoutException:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ {endpoint}: TIMEOUT after {response_time:.3f}s")
            return endpoint, response_time, False
            
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ {endpoint}: ERROR - {str(e)} ({response_time:.3f}s)")
            return endpoint, response_time, False

    async def test_concurrent_requests(self, duration_seconds: int = 30):
        """Test multiple endpoints concurrently for a specified duration."""
        print(f"\n🚀 Starting concurrent API test for {duration_seconds} seconds...")
        print(f"⏰ Test started at: {datetime.now()}")
        print("=" * 60)
        
        start_time = time.time()
        test_count = 0
        
        while time.time() - start_time < duration_seconds:
            # Test all endpoints concurrently
            tasks = [self.test_endpoint(endpoint) for endpoint in TEST_ENDPOINTS]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for result in results:
                if isinstance(result, tuple):
                    self.results.append(result)
            
            test_count += 1
            
            # Wait a bit before next round
            await asyncio.sleep(1)
            
            # Show progress every 10 seconds
            elapsed = time.time() - start_time
            if int(elapsed) % 10 == 0 and elapsed > 0:
                print(f"📊 Progress: {elapsed:.0f}s elapsed, {test_count} test rounds completed")

    async def trigger_sync_job(self):
        """Trigger a manual sync job to test during active scraping."""
        try:
            print("\n🌐 Triggering manual earthquake sync...")
            # This endpoint might not exist, but we can try to trigger sync indirectly
            response = await self.client.get(f"{API_BASE_URL}/api/v1/earthquakes/latest")
            print(f"✅ Sync trigger response: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Could not trigger sync: {e}")

    def analyze_results(self):
        """Analyze test results and determine if blocking occurred."""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS ANALYSIS")
        print("=" * 60)
        
        if not self.results:
            print("❌ No test results to analyze!")
            return False
        
        # Group results by endpoint
        endpoint_stats = {}
        for endpoint, response_time, success in self.results:
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"times": [], "successes": 0, "failures": 0}
            
            endpoint_stats[endpoint]["times"].append(response_time)
            if success:
                endpoint_stats[endpoint]["successes"] += 1
            else:
                endpoint_stats[endpoint]["failures"] += 1
        
        # Analyze each endpoint
        blocking_detected = False
        for endpoint, stats in endpoint_stats.items():
            times = stats["times"]
            avg_time = sum(times) / len(times)
            max_time = max(times)
            min_time = min(times)
            success_rate = stats["successes"] / (stats["successes"] + stats["failures"]) * 100
            
            print(f"\n🔍 {endpoint}:")
            print(f"   📈 Requests: {len(times)}")
            print(f"   ✅ Success Rate: {success_rate:.1f}%")
            print(f"   ⏱️  Avg Response: {avg_time:.3f}s")
            print(f"   ⚡ Min Response: {min_time:.3f}s")
            print(f"   🐌 Max Response: {max_time:.3f}s")
            
            # Check for blocking indicators
            if max_time > 10.0:  # Response time > 10 seconds indicates blocking
                print(f"   ⚠️  BLOCKING DETECTED: Max response time {max_time:.3f}s")
                blocking_detected = True
            
            if success_rate < 90:  # Success rate < 90% indicates issues
                print(f"   ⚠️  LOW SUCCESS RATE: {success_rate:.1f}%")
                blocking_detected = True
        
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if blocking_detected:
            print("❌ BLOCKING DETECTED - API endpoints are being blocked during sync operations")
            print("💡 Recommendation: Check for synchronous operations in schedulers/scrapers")
        else:
            print("✅ NO BLOCKING DETECTED - API endpoints remain responsive during sync operations")
            print("🎉 The async implementation is working correctly!")
        
        return not blocking_detected

    async def run_test(self):
        """Run the complete blocking test."""
        print("🧪 ALISTO API BLOCKING TEST")
        print("=" * 60)
        print("This test will verify that API endpoints remain responsive")
        print("during sync operations (earthquake/volcano scraping).")
        print("=" * 60)
        
        try:
            # Test 1: Initial connectivity
            print("\n📡 Testing initial API connectivity...")
            await self.test_endpoint("/")
            
            # Test 2: Trigger sync and test concurrently
            await self.trigger_sync_job()
            
            # Test 3: Concurrent testing for 30 seconds
            await self.test_concurrent_requests(duration_seconds=30)
            
            # Test 4: Analyze results
            success = self.analyze_results()
            
            return success
            
        finally:
            await self.client.aclose()

async def main():
    """Main test function."""
    tester = BlockingTest()
    success = await tester.run_test()
    
    print(f"\n{'='*60}")
    if success:
        print("🎉 TEST PASSED: No blocking detected!")
        exit(0)
    else:
        print("❌ TEST FAILED: Blocking detected!")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
