// server.js
// This is the web server Thamannah's backend will send requests to.

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { evaluateWithVerification } = require("./evaluateWithVerification.cjs");
const { releaseCollateral, noAction } = require("./creditcoinService");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * POST /creditcoin-action
 *
 * Expected request body (agreed schema — coming from Thamannah's /evaluate):
 * {
 *   "decision": "APPROVE" | "BLOCK",
 *   "borrower_wallet_address": "0x...",
 *   "amount_usdc": 500
 * }
 */
app.post("/creditcoin-action", async (req, res) => {
  const { decision, borrower_wallet_address, amount_usdc } = req.body;

  // Basic validation first — fail loudly and clearly if something's missing.
  if (!decision) {
    return res.status(400).json({ error: "Missing 'decision' field in request body" });
  }

  if (decision === "APPROVE") {
    if (!borrower_wallet_address || !amount_usdc) {
      return res.status(400).json({
        error: "APPROVE requires 'borrower_wallet_address' and 'amount_usdc'",
      });
    }
    const result = await releaseCollateral(borrower_wallet_address, amount_usdc);
    return res.json(result);
  }

  if (decision === "BLOCK") {
    const result = noAction("policy_condition_failed");
    return res.json(result);
  }

  // Anything else (unexpected decision value) — respond clearly instead of guessing.
  return res.status(400).json({
    error: `Unrecognized decision value: '${decision}'. Expected 'APPROVE' or 'BLOCK'.`,
  });
});

/**
 * POST /evaluate-with-verification
 *
 * Frontend-facing endpoint. Wraps evaluateWithVerification():
 *   1. Runs Attestcoin verification against a source-chain tx hash
 *   2. Calls /evaluate with evidence.verified set accordingly
 *   3. Returns /evaluate's decision + verified_evidence (if verification succeeded)
 *
 * Expected request body:
 * {
 *   "wallet": "0x...",
 *   "requestedAmount": 500,
 *   "evidenceBase": { "event": "loan_repayment", "amount": 500, "asset": "USDC", "source_chain": "ethereum_sepolia" },
 *   "sourceTxHash": "0x..."
 * }
 */
app.post("/evaluate-with-verification", async (req, res) => {
  const { wallet, requestedAmount, evidenceBase, sourceTxHash } = req.body;

  if (!wallet || !requestedAmount || !evidenceBase || !sourceTxHash) {
    return res.status(400).json({
      error:
        "Missing required fields: wallet, requestedAmount, evidenceBase, sourceTxHash are all required",
    });
  }

  try {
    const result = await evaluateWithVerification({
      wallet,
      requestedAmount,
      evidenceBase,
      sourceTxHash,
      signerPrivateKey: process.env.PRIVATE_KEY,
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      error: `evaluate-with-verification failed: ${err.message}`,
    });
  }
});

// Simple health check — lets you (or Thamannah) quickly confirm the server is alive.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "creditcoin-action-service" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Creditcoin action service running on http://localhost:${PORT}`);
});
