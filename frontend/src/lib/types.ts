// Mirrors backend/schemas/decision.py and Thamannah's
// /evaluate-with-verification connector — keep in sync.

// Used only for display purposes (e.g. EvidenceCard), synthesized from the
// request + response after the fact — not sent over the wire as-is anymore.
export interface Evidence {
  event: string;
  amount: number;
  asset: string;
  source_chain: string;
  verified: boolean;
}

export interface EvidenceBase {
  event: string;
  amount: number;
  asset: string;
  source_chain: string;
}

export type Decision = "APPROVE" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type PolicyStatus = "PASS" | "FAIL";
export type RecommendedAction = "RELEASE" | "DO_NOT_RELEASE";

export interface VerifiedEvidence {
  chainKey: number;
  blockHeight: number;
  txHash: string;
  verificationTxHash: string;
  block_explorer_url: string;
}

export interface EvaluationResponse {
  decision: Decision;
  risk_level: RiskLevel;
  policy_status: PolicyStatus;
  reason: string;
  recommended_action: RecommendedAction;
  // Only present when Hadi's Attestcoin verification actually ran and
  // succeeded. Must be handled as optional everywhere it's displayed.
  verified_evidence?: VerifiedEvidence;
  // Present when verification was attempted but failed — evidence.verified
  // was still correctly passed to /evaluate as false, this is just extra
  // debugging context from the connector.
  verification_error?: string;
}

// Body shape for Thamannah's connector: POST /evaluate-with-verification
// (port 4000). This replaces calling Asad's /evaluate directly — the
// connector runs Attestcoin verification against sourceTxHash first, then
// calls /evaluate with evidence.verified set to the real result, then (if
// verification succeeded) attaches verified_evidence to the response.
// There is no manual "verified" checkbox anymore — it's a real proof.
export interface EvaluateWithVerificationRequest {
  wallet: string;
  requestedAmount: number;
  evidenceBase: EvidenceBase;
  sourceTxHash: string;
}

// Matches Hadi's creditcoin-action-service response schema exactly
// (backend/creditcoin-action-service/creditcoinService.js).
export interface CreditcoinActionResponse {
  action_taken: boolean;
  action_type: "release_collateral" | "none";
  transaction_hash: string | null;
  status: "confirmed" | "not_executed" | "error";
  chain?: string;
  block_explorer_url?: string;
  reason?: string;
}

// A full case record: the request that was submitted + the response that
// came back. This is what flows through Agent Status -> Audit Timeline.
// The backend doesn't persist cases yet, so the frontend carries this
// client-side (sessionStorage) between screens using `request_id`.
export interface CaseRecord {
  request_id: string;
  created_at: string;
  request: EvaluateWithVerificationRequest;
  response: EvaluationResponse;
  creditcoin_action?: CreditcoinActionResponse;
}
