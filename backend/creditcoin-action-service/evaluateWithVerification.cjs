// evaluateWithVerification.cjs
//
// The integration piece connecting Hadi's Attestcoin verification to
// Asad's /evaluate endpoint. This is Thamannah's connector.
//
// Flow:
//   1. Run Attestcoin verification against a source-chain tx hash
//      (using Hadi's attestcoinVerification.cjs)
//   2. Build the /evaluate request, setting evidence.verified based on
//      whether that verification actually succeeded
//   3. Call /evaluate (Asad's Python service)
//   4. If verification succeeded, attach verified_evidence to the response
//      so the frontend has the proof details to display
//
// IMPORTANT: verification failing does NOT throw / block the whole request —
// it just means evidence.verified = false gets passed to /evaluate, and
// Asad's policy engine is responsible for treating that as a hard BLOCK.
// This connector's job is only to relay an honest verification result,
// never to decide the outcome itself.

require("dotenv").config();
const { verifySourceChainEvent } = require("./attestcoinVerification.cjs");

// Set this once Asad confirms the real host/port for /evaluate.
const EVALUATE_URL = process.env.EVALUATE_URL || "http://localhost:8000/evaluate";

/**
 * @param {Object} params
 * @param {string} params.wallet - borrower wallet address
 * @param {number} params.requestedAmount - requested collateral release amount
 * @param {Object} params.evidenceBase - everything /evaluate needs EXCEPT "verified"
 *   e.g. { event, amount, asset, source_chain }
 * @param {string} params.sourceTxHash - the source-chain (e.g. Sepolia) tx hash to verify
 * @param {string} params.signerPrivateKey - wallet used to submit the on-chain verification tx
 * @param {number} [params.chainKey] - defaults to Sepolia (1) inside attestcoinVerification.cjs
 */
async function evaluateWithVerification({
  wallet,
  requestedAmount,
  evidenceBase,
  sourceTxHash,
  signerPrivateKey,
  chainKey,
}) {
  let verified = false;
  let verifiedEvidence = null;
  let verificationError = null;

  // Step 1: attempt Attestcoin verification. Never let this throw past this
  // point — a failure just means verified stays false, which /evaluate's
  // policy layer must treat as a hard BLOCK.
  try {
    const result = await verifySourceChainEvent(sourceTxHash, signerPrivateKey, chainKey);
    verified = true;
    verifiedEvidence = result; // { chainKey, blockHeight, txHash, verificationTxHash, block_explorer_url }
  } catch (err) {
    verified = false;
    verificationError = err.message;
    console.error("Attestcoin verification failed:", err.message);
    // Deliberately not re-thrown — we still call /evaluate with verified:false
    // so policy can make an informed BLOCK decision, rather than the whole
    // request just crashing.
  }

  // Step 2: build the /evaluate request in the exact shape Asad specified.
  const evaluateRequest = {
    wallet,
    requested_amount: requestedAmount,
    evidence: {
      ...evidenceBase, // event, amount, asset, source_chain
      verified,
    },
  };

  // Step 3: call /evaluate.
  let evaluateResponse;
  try {
    const res = await fetch(EVALUATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evaluateRequest),
    });

    if (!res.ok) {
      throw new Error(`/evaluate returned HTTP ${res.status}`);
    }

    evaluateResponse = await res.json();
  } catch (err) {
    throw new Error(`Failed to reach /evaluate: ${err.message}`);
  }

  // Step 4: attach verified_evidence when we actually have it. Never fabricate
  // this field when verification didn't succeed.
  if (verified && verifiedEvidence) {
    evaluateResponse.verified_evidence = verifiedEvidence;
  }

  // Surface the verification failure reason too, even though /evaluate's
  // own "reason" field should already reflect the BLOCK — this makes
  // debugging easier without changing /evaluate's contract.
  if (!verified && verificationError) {
    evaluateResponse.verification_error = verificationError;
  }

  return evaluateResponse;
}

module.exports = { evaluateWithVerification };
