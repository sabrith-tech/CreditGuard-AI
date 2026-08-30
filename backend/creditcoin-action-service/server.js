// server.js
// This is the web server Thamannah's backend will send requests to.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Simple health check — lets you (or Thamannah) quickly confirm the server is alive.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "creditcoin-action-service" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Creditcoin action service running on http://localhost:${PORT}`);
});
