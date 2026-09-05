from pydantic import BaseModel, Field

class Evidence(BaseModel):
    event: str
    amount: float = Field(gt=0, description="Evidence amount must be greater than 0")
    asset: str
    source_chain: str
    verified: bool

class EvaluationRequest(BaseModel):
    wallet: str
    requested_amount: float = Field(gt=0, description="Requested amount must be greater than 0")
    evidence: Evidence

class EvaluationResponse(BaseModel):
    decision: str
    risk_level: str
    policy_status: str
    reason: str
    recommended_action: str
