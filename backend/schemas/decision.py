from pydantic import BaseModel

class Evidence(BaseModel):
    event: str
    amount: float
    asset: str
    source_chain: str
    verified: bool

class EvaluationRequest(BaseModel):
    wallet: str
    requested_amount: float
    evidence: Evidence

class EvaluationResponse(BaseModel):
    decision: str
    risk_level: str
    policy_status: str
    reason: str
    recommended_action: str