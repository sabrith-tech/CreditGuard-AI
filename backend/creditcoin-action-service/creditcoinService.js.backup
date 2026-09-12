// creditcoinService.js
// This file handles all direct communication with the Creditcoin blockchain.
// Keeping it separate from server.js means the "web server" logic and the
// "blockchain" logic don't get tangled together.

const { ethers } = require("ethers");
require("dotenv").config();

// --- Contract setup ---
// TODO: Replace this ABI with the real ABI of your deployed action/release contract.
// For now this is a placeholder shape with one function: releaseCollateral(address borrower, uint256 amount)
const CONTRACT_ABI = [
  "function releaseCollateral(address borrower, uint256 amount) public returns (bool)",
];

// We build the provider/wallet/contract LAZILY (only when actually needed for an
// APPROVE action), not at server startup. This means the server can still start
// and handle BLOCK requests even before real .env values are filled in.
function validateEnv() {
  const missing = ["RPC_URL", "PRIVATE_KEY", "CONTRACT_ADDRESS"].filter(
    (name) => !process.env[name] || process.env[name].trim() === ""
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Copy .env.example to .env and fill in real values.`
    );
  }

  const rawKey = process.env.PRIVATE_KEY.trim();
  const hexKey = rawKey.startsWith("0x") ? rawKey.slice(2) : rawKey;

  if (!/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    throw new Error(
      "PRIVATE_KEY is not set to a valid 64-character hex value. " +
        "Check your .env file — it looks like it still contains a placeholder " +
        "or malformed value (never share the actual key value in logs/chat)."
    );
  }

  if (!ethers.isAddress(process.env.CONTRACT_ADDRESS)) {
    throw new Error("CONTRACT_ADDRESS is not a valid address. Check your .env file.");
  }
}

function getContract() {
  validateEnv();

  const rawKey = process.env.PRIVATE_KEY.trim();
  const normalizedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(normalizedKey, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
}

/**
 * Fires the on-chain "release collateral" action when a loan is APPROVED.
 * Returns a clean object matching the schema we agreed with Thamannah.
 */
async function releaseCollateral(borrowerAddress, amountUsdc) {
  try {
    const contract = getContract();
    const tx = await contract.releaseCollateral(borrowerAddress, amountUsdc);
    const receipt = await tx.wait(); // wait for the transaction to be confirmed on-chain

    return {
      action_taken: true,
      action_type: "release_collateral",
      transaction_hash: receipt.hash,
      status: "confirmed",
      chain: "creditcoin_testnet",
      block_explorer_url: `https://creditcoin-testnet.blockscout.com/tx/${receipt.hash}`,
    };
  } catch (err) {
    // If the blockchain call fails (out of gas, network issue, etc.), report it
    // clearly instead of crashing the whole server.
    return {
      action_taken: false,
      action_type: "none",
      transaction_hash: null,
      status: "error",
      reason: `Blockchain call failed: ${err.message}`,
    };
  }
}

/**
 * Used for the BLOCK case — no blockchain call happens at all,
 * we just return a consistent "nothing happened" response.
 */
function noAction(reason) {
  return {
    action_taken: false,
    action_type: "none",
    transaction_hash: null,
    status: "not_executed",
    reason: reason || "policy_condition_failed",
  };
}

module.exports = { releaseCollateral, noAction };
