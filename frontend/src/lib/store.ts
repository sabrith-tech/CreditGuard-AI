import { CaseRecord } from "./types";

const KEY_PREFIX = "creditguard:case:";

export function saveCase(record: CaseRecord) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY_PREFIX + record.request_id, JSON.stringify(record));
}

export function loadCase(requestId: string): CaseRecord | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY_PREFIX + requestId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CaseRecord;
  } catch {
    return null;
  }
}

export function makeRequestId() {
  return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Hadi's placeholder counterfactual-block payload, translated into the
// current CaseRecord shape so the block scenario is always demoable even
// if the live backend, AI, or Attestcoin verification is unavailable
// during the pitch. No verification actually ran for this fallback case,
// so there's no verified_evidence — the badge correctly won't show.
export function blockDemoCase(): CaseRecord {
  const requestId = "req_demo_block_001";
  const record: CaseRecord = {
    request_id: requestId,
    created_at: "2026-08-29T10:00:00Z",
    request: {
      wallet: "0x842CA2ca5f780478D7B7e83201C83e93b0dE41e9",
      requestedAmount: 500,
      evidenceBase: {
        event: "repayment",
        amount: 200,
        asset: "USDC",
        source_chain: "ethereum_sepolia",
      },
      sourceTxHash:
        "0xTESTHASHBLOCKCASE0000000000000000000000000000",
    },
    response: {
      decision: "BLOCK",
      risk_level: "MEDIUM",
      policy_status: "FAIL",
      reason:
        "Actual repayment (200 USDC) is below required repayment (500 USDC).",
      recommended_action: "DO_NOT_RELEASE",
    },
    creditcoin_action: {
      action_taken: false,
      action_type: "none",
      transaction_hash: null,
      status: "not_executed",
      reason: "policy_condition_failed",
    },
  };
  saveCase(record);
  return record;
}
