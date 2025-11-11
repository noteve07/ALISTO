# app/api/v1/routers/risk_evaluations.py
from fastapi import APIRouter
from app.core.database import supabase
from app.services.risk_assessment import RiskAssessmentService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/risk", tags=["Risk Evaluation"])



@router.post("/update-risk-level")
async def update_risk_level():
    """Update risk levels for provinces based on latest earthquake data and ML predictions"""
    try:
        logger.info("🚀 Risk level update requested via API")
        
        # Initialize risk assessment service
        risk_service = RiskAssessmentService()
        
        # Update high-risk provinces in database (includes console output)
        result = risk_service.update_high_risk_provinces_in_database()
        
        if result['success']:
            return {
                "success": True,
                "message": f"Risk assessment and database update completed. {result['updated_provinces']} high-risk provinces updated in database.",
                "data": {
                    "updated_provinces": result['updated_provinces'],
                    "total_high_risk": result.get('total_high_risk', 0),
                    "failed_provinces": result.get('failed_provinces', []),
                    "console_output": "Check server console for detailed results"
                }
            }
        else:
            return {
                "success": False,
                "error": f"Risk assessment or database update failed: {result.get('error', 'Unknown error')}",
                "data": None
            }
            
    except Exception as e:
        logger.error(f"❌ Error updating risk levels: {e}")
        return {
            "success": False,
            "error": f"Failed to update risk levels: {str(e)}",
            "data": None
        }


@router.get("/health")
async def check_risk_assessment_health():
    """Check the health of risk assessment services"""
    try:
        risk_service = RiskAssessmentService()
        health_status = risk_service.validate_services_health()
        
        return {
            "success": True,
            "data": health_status
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": None
        }


@router.get("/provinces")
async def get_all_province_risk_evaluations():
    """Get risk evaluation data for all provinces"""
    try:
        # Fetch joined data manually
        provinces = supabase.table("provinces").select("province_id, name").execute()
        risks = supabase.table("risk_evaluations").select("*").execute()

        # Convert risk data to dict by province_id for fast lookup
        risk_map = {r["province_id"]: r for r in risks.data}

        formatted_data = []
        for p in provinces.data:
            risk = risk_map.get(p["province_id"])
            formatted_data.append({
                "province_id": p["province_id"],
                "province_name": p["name"],
                "risk_data": {
                    "base_risk_score": risk.get("base_risk_score") if risk else None,
                    "dynamic_risk_score": risk.get("dynamic_risk_score") if risk else None,
                    "risk_level": risk.get("risk_level") if risk else None,
                    "factors": risk.get("factors") if risk else None,
                    "calculated_at": risk.get("calculated_at") if risk else None,
                } if risk else None
            })

        return {
            "success": True,
            "count": len(formatted_data),
            "data": formatted_data
        }

    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
            "data": [],
        }
