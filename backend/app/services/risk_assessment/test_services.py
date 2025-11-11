"""
Quick test script for the risk assessment services
Run this to test the services before integrating with the API
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..')
sys.path.insert(0, backend_dir)

from app.services.risk_assessment import RiskAssessmentService
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_risk_assessment():
    """Test the complete risk assessment pipeline"""
    try:
        print("🧪 Testing Risk Assessment Services...")
        print("=" * 60)
        
        # Initialize service
        risk_service = RiskAssessmentService()
        
        # Test health check
        print("🔍 Testing health check...")
        health = risk_service.validate_services_health()
        print(f"Health Status: {health['overall_status']}")
        
        if health['overall_status'] != 'healthy':
            print("❌ Services are not healthy. Check configuration.")
            print(health)
            return
        
        # Run complete assessment (console only)
        print("\n🚀 Running complete risk assessment (console only)...")
        result = risk_service.run_complete_risk_assessment()
        
        if result['success']:
            print(f"✅ Assessment completed successfully!")
            print(f"📊 Summary: {result['summary']}")
            
            if result['high_risk_provinces']:
                print(f"\n🔥 {len(result['high_risk_provinces'])} High-Risk Provinces:")
                for province in result['high_risk_provinces']:
                    print(f"  • {province['province_name']} (Prob: {province['risk_probability']:.3f})")
            else:
                print("\n✅ No high-risk provinces detected")
        else:
            print(f"❌ Assessment failed: {result['error']}")
        
        # Test database update functionality
        print(f"\n💾 Testing database update for high-risk provinces...")
        db_result = risk_service.update_high_risk_provinces_in_database()
        
        if db_result['success']:
            print(f"✅ Database update completed!")
            print(f"📊 Updated provinces: {db_result['updated_provinces']}")
            if db_result.get('failed_provinces'):
                print(f"⚠️  Failed updates: {db_result['failed_provinces']}")
        else:
            print(f"❌ Database update failed: {db_result.get('error', 'Unknown error')}")
        
        print("\n" + "=" * 60)
        print("🎉 Test completed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_risk_assessment()