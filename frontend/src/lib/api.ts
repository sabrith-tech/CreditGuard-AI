import {
  EvaluateWithVerificationRequest,
  EvaluationResponse,
  CreditcoinActionResponse,
} from "./types";

// Hadi's creditcoin-action-service — hosts BOTH /evaluate-with-verification
// (Thamannah's connector) and /creditcoin-action.
export const CREDITCOIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_CREDITCOIN_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {}

// The AI/verification call can occasionally hang with no error at all
// rather than failing fast. Without a timeout, fetch just sits there
// forever and the UI never recovers. This wraps fetch with an
// AbortController so a stuck request surfaces as a clear, retryable error.
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Calls Thamannah's connector: verifies sourceTxHash via Hadi's Attestcoin
// integration, then calls Asad's /evaluate with the real verification
// result, then attaches verified_evidence when verification succeeded.
// This replaces calling /evaluate directly — there's no more manual
// "verified" checkbox, the proof is real now.
export async function evaluateWithVerification(
  payload: EvaluateWithVerificationRequest
): Promise<EvaluationResponse> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${CREDITCOIN_API_BASE_URL}/evaluate-with-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      30_000
    );
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ApiError(
        "This is taking longer than expected. Please try again in a moment."
      );
    }
    throw new ApiError(
      "We couldn't connect to the evaluation service right now. Please try again shortly."
    );
  }

  if (!res.ok) {
    throw new ApiError(
      "Something went wrong while evaluating this request. Please try again."
    );
  }

  return res.json();
}

// Calls Hadi's real Creditcoin action endpoint. For APPROVE this fires an
// actual testnet transaction, so it can take longer to confirm — timeout
// is generous (45s). If this service is down or too slow, we don't want
// to break the whole flow — the evaluation result still stands, we just
// mark the action as unavailable.
export async function requestCreditcoinAction(
  decision: "APPROVE" | "BLOCK",
  borrowerWalletAddress: string,
  amountUsdc: number
): Promise<CreditcoinActionResponse> {
  const body =
    decision === "APPROVE"
      ? {
          decision,
          borrower_wallet_address: borrowerWalletAddress,
          amount_usdc: amountUsdc,
        }
      : { decision };

  try {
    const res = await fetchWithTimeout(
      `${CREDITCOIN_API_BASE_URL}/creditcoin-action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      45_000
    );

    if (!res.ok) {
      return {
        action_taken: false,
        action_type: "none",
        transaction_hash: null,
        status: "error",
        reason: "The Creditcoin action couldn't be completed right now. Your decision above is still valid — please try again shortly.",
      };
    }

    return res.json();
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === "AbortError";
    return {
      action_taken: false,
      action_type: "none",
      transaction_hash: null,
      status: "error",
      reason: timedOut
        ? "This is taking longer than expected. It may still complete — check back shortly, or try again."
        : "We couldn't connect to the Creditcoin network right now. Please try again shortly.",
    };
  }
}