// testEvaluateWithVerification.cjs
// Run this once Hadi's attestcoinVerification.cjs is pulled, to confirm the
// full chain works: Attestcoin verify -> /evaluate -> verified_evidence attached.

require("dotenv").config();
const { evaluateWithVerification } = require("./evaluateWithVerification.cjs");

evaluateWithVerification({
  wallet: "0xb1B70643589838F8febE3314ec95C56d22aef1C5",
  requestedAmount: 500,
  evidenceBase: {
    event: "loan_repayment",
    amount: 500,
    asset: "USDC",
    source_chain: "ethereum_sepolia",
  },
  sourceTxHash: "0x70f2a7b8cc81b247b5b79f055fe1bed525fb9609f352d9fa2dfebbcb7a71d6da", // your real faucet tx
  signerPrivateKey: process.env.PRIVATE_KEY,
})
  .then((result) => {
    console.log("FULL RESULT:", JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error("FAILED:", err.message);
  });
