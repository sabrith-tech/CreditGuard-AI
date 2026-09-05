// attestcoinVerification.js
//
// This is the piece Thamannah asked us to build: before releaseCollateral()
// fires on APPROVE, we must prove a real event happened on another chain
// (e.g. a Sepolia repayment) using Creditcoin's Attestcoin Protocol.
//
// Flow (matches Thamannah's checklist exactly):
//   1. Resolve chains via chainInfo.PrecompileChainInfoProvider
//   2. Generate proof via proofProvider.service.ProofBuilder
//      (NOTE: in the currently installed SDK version, this replaced the
//      older "proofGenerator.api.ProverAPIProofGenerator" name mentioned in
//      some docs — same purpose, renamed.)
//   3. Verify on-chain via blockProver.PrecompileBlockProver
//   4. Gate releaseCollateral() on that passing
//
// chainKey 1 = Ethereum Sepolia on Creditcoin Testnet, confirmed working by
// Thamannah against https://rpc.cc3-testnet.creditcoin.network/

const { JsonRpcProvider, Wallet } = require("ethers");
const { chainInfo, blockProver, proofProvider } = require("@gluwa/usc-sdk");
require("dotenv").config();

const CREDITCOIN_RPC_URL = process.env.RPC_URL || "https://rpc.cc3-testnet.creditcoin.network/";
const SEPOLIA_CHAIN_KEY = 1; // confirmed by Thamannah against our RPC
const PROVER_API_URL = process.env.PROVER_API_URL || "https://proof-gen-api.cc3-testnet.creditcoin.network/";

const creditcoinProvider = new JsonRpcProvider(CREDITCOIN_RPC_URL);

/**
 * Step 1: Confirms the source chain is actually supported by Creditcoin's
 * Attestcoin Protocol right now, before we waste time generating a proof
 * for a chain that isn't attested.
 */
async function resolveChain(chainKey = SEPOLIA_CHAIN_KEY) {
  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(creditcoinProvider);
  const info = await chainInfoProvider.getSupportedChainByKey(chainKey);
  if (!info) {
    throw new Error(`Chain key ${chainKey} is not supported by Attestcoin on this network`);
  }
  return info;
}

/**
 * Step 2: Generates a real Merkle + continuity proof for a transaction that
 * happened on the source chain (e.g. a Sepolia repayment tx), by calling
 * Creditcoin's hosted Proof Generation API.
 */
async function generateProof(transactionHash, chainKey = SEPOLIA_CHAIN_KEY) {
  const proofBuilder = new proofProvider.service.ProofBuilder(chainKey, PROVER_API_URL);

  const result = await proofBuilder.getProof(transactionHash);
  if (!result.success) {
    throw new Error(`Proof generation failed: ${result.error}`);
  }
  return result.data; // { chainKey, headerNumber, txIndex, txHash, txBytes, continuityProof, merkleProof, cached, generatedAt }
}

/**
 * Step 3 + 4: Verifies the generated proof on-chain via the real Attestcoin
 * precompile (verifyAndEmit — creates a permanent on-chain record), and only
 * returns true if that verification actually succeeded. This is the gate
 * that must pass before releaseCollateral() is allowed to fire.
 */
async function verifyProofOnChain(proofData, signerPrivateKey) {
  const signer = new Wallet(signerPrivateKey, creditcoinProvider);
  const prover = new blockProver.PrecompileBlockProver(creditcoinProvider);

  const tx = await prover.verifyAndEmitSingle(
    signer,
    proofData.chainKey,
    proofData.headerNumber,
    proofData.txBytes,
    proofData.merkleProof,
    proofData.continuityProof
  );
  const receipt = await tx.wait();

  return {
    verified: true,
    verificationTxHash: receipt.hash,
    block_explorer_url: `https://creditcoin-testnet.blockscout.com/tx/${receipt.hash}`,
  };
}

/**
 * The full end-to-end gate: given a real source-chain transaction hash,
 * proves it happened (via Attestcoin) and returns everything
 * creditcoinService.js needs to then call releaseCollateral() on our
 * CreditGuardAction contract.
 *
 * Throws if verification fails at any step — callers should treat that as
 * "do NOT release collateral", not silently continue.
 */
async function verifySourceChainEvent(transactionHash, signerPrivateKey, chainKey = SEPOLIA_CHAIN_KEY) {
  await resolveChain(chainKey); // Step 1: confirm chain is supported

  const proofData = await generateProof(transactionHash, chainKey); // Step 2

  const verification = await verifyProofOnChain(proofData, signerPrivateKey); // Steps 3+4

  return {
    chainKey: proofData.chainKey,
    blockHeight: proofData.headerNumber,
    txHash: proofData.txHash,
    verificationTxHash: verification.verificationTxHash,
    block_explorer_url: verification.block_explorer_url,
  };
}

module.exports = { resolveChain, generateProof, verifyProofOnChain, verifySourceChainEvent };
