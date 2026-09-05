from fastapi import APIRouter
from backend.schemas.decision import EvaluationRequest, EvaluationResponse
from backend.services.ai_services import analyze_evidence
router = APIRouter()


@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_request(data: EvaluationRequest):
    requested_amount = data.requested_amount
    evidence = data.evidence

    ai_result = analyze_evidence(evidence.model_dump())

    if not evidence.verified:
        return {
            "decision": "BLOCK",
            "risk_level": "HIGH",
            "policy_status": "FAIL",
            "reason": "The provided evidence is not verified.",
            "recommended_action": "DO_NOT_RELEASE"
        }

    if evidence.amount < requested_amount:
        return {
            "decision": "BLOCK",
            "risk_level": "MEDIUM",
            "policy_status": "FAIL",
            "reason": "The provided evidence amount is lower than the requested amount.",
            "recommended_action": "DO_NOT_RELEASE"
        }

    allowed_risk_levels = {"LOW", "MEDIUM", "HIGH"}
    ai_risk = str(ai_result.get("risk", "")).upper()
    if ai_risk not in allowed_risk_levels:
        ai_risk = "MEDIUM"  # fallback if the AI returns something unexpected

    if ai_result.get("assessment") != "VALID":
        return {
            "decision": "BLOCK",
            "risk_level": ai_risk,
            "policy_status": "FAIL",
            "reason": ai_result["explanation"],
            "recommended_action": "DO_NOT_RELEASE"
        }

    return {
        "decision": "APPROVE",
        "risk_level": ai_risk,
        "policy_status": "PASS",
        "reason": ai_result["explanation"],
        "recommended_action": "RELEASE"
    }
