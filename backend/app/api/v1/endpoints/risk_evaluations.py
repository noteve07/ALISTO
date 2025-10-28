# app/api/v1/routers/risk_evaluations.py
from fastapi import APIRouter
from app.core.database import supabase

router = APIRouter(prefix="/risk", tags=["Risk Evaluation"])



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
