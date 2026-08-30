# Creditcoin Action Service

Owned by: Hadi
Purpose: Receives a decision (APPROVE/BLOCK) from Thamannah's `/evaluate` backend and either
fires a real Creditcoin transaction (APPROVE) or confirms no action was taken (BLOCK).

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment template and fill in real values:
   ```
   cp .env.example .env
   ```
   Then edit `.env` with your real RPC URL, private key, and contract address.
   **Never commit `.env` to GitHub** — it's already in `.gitignore`.

3. Run the server:
   ```
   npm start
   ```
   You should see: `Creditcoin action service running on http://localhost:4000`

## Testing it locally (before Thamannah connects to it)

Test the BLOCK case:
```bash
curl -X POST http://localhost:4000/creditcoin-action \
  -H "Content-Type: application/json" \
  -d '{"decision": "BLOCK"}'
```

Test the APPROVE case (requires a real deployed contract + funded wallet):
```bash
curl -X POST http://localhost:4000/creditcoin-action \
  -H "Content-Type: application/json" \
  -d '{"decision": "APPROVE", "borrower_wallet_address": "0xb1B70643589838F8febE3314ec95C56d22aef1C5", "amount_usdc": 500}'
```

## Response schema

**APPROVE (success):**
```json
{
  "action_taken": true,
  "action_type": "release_collateral",
  "transaction_hash": "0x...",
  "status": "confirmed",
  "chain": "creditcoin_testnet",
  "block_explorer_url": "https://creditcoin-testnet.blockscout.com/tx/0x..."
}
```

**BLOCK (no action):**
```json
{
  "action_taken": false,
  "action_type": "none",
  "transaction_hash": null,
  "status": "not_executed",
  "reason": "policy_condition_failed"
}
```

## TODO before this is demo-ready
- [ ] Deploy the real collateral-release contract to Creditcoin Testnet
- [ ] Replace placeholder ABI in `creditcoinService.js` with the real one
- [ ] Fund the wallet in `.env` with tCTC from the faucet
- [ ] Share final endpoint URL + this schema with Thamannah for integration
