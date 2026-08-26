from fastapi.testclient import TestClient
from backend.main import app    

client = TestClient(app)

def test_approve_request():
    response = client.post("/evaluate", json={
        "wallet": "0x123456",
        "requested_amount": 500,
        "evidence": {
            "event": "repayment",
            "amount": 500,
            "asset": "USDC",
            "source_chain": "Ethereum",
            "verified": True        
        }
    }
    )

    assert response.status_code == 200
    print("STATUS:", response.status_code)
    print("RAW RESPONSE:", response.text)
    data = response.json()
    print("DATA:", data)
    assert data["decision"] == "APPROVE"
    assert data["policy_status"] == "PASS"
    assert data["recommended_action"] == "RELEASE"

def test_block_insufficient_amount():
    response = client.post("/evaluate", json={
        "wallet": "0x123456",
        "requested_amount": 500,
        "evidence": {
            "event": "repayment",
            "amount": 200,
            "asset": "USDC",
            "source_chain": "Ethereum",
            "verified": True        
        }
    }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCK"
    assert data["policy_status"] == "FAIL"
    assert data["recommended_action"] == "DO_NOT_RELEASE"

def test_block_unverified_evidence():
    response = client.post("/evaluate", json={
        "wallet": "0x123456",
        "requested_amount": 500,
        "evidence": {
            "event": "repayment",
            "amount": 500,
            "asset": "USDC",
            "source_chain": "Ethereum",
            "verified": False        
        }
    }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCK"
    assert data["policy_status"] == "FAIL"
    assert data["recommended_action"] == "DO_NOT_RELEASE"
    