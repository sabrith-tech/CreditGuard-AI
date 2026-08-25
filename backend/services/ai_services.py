import os
from google import genai
from pydantic import BaseModel

class AIAnalysis(BaseModel):
    assessment: str
    risk: str
    explanation: str

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_evidence(evidence: dict) -> dict:
    prompt = f"""
    You are the CreditGuard AI analysis assistant. Analyze ONLY the verified evidence provided below. Do not invent transactions, wallet activity, verification status, amounts, or other financial facts. 
    If the evidence is verified and internally consistent, classify it as VALID. If the evidence is unverified, contradictory, missing, or suspicious, classify it as INVALID or UNVERIFIED.


    Evidence:
    {evidence}

    Return your assessment using the required structured format.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": AIAnalysis,
        },
    )

    result = response.parsed

    return result.model_dump()