# CreditGuard AI 

Next.js 15 (App Router) + TypeScript + Tailwind. Talks to Thamannah's
FastAPI backend at `http://localhost:8000` (see `.env.local`).

## Run it

You need **two backend services** running alongside this frontend:

1. **Thamannah's `/evaluate` API** (from the `backend/` repo):
   ```
   uvicorn backend.main:app --reload
   ```
   Live at `http://localhost:8000/health`.

2. **Hadi's Creditcoin action service** (`backend/creditcoin-action-service/`):
   ```
   cd backend/creditcoin-action-service
   npm install
   cp .env.example .env   # fill in your own testnet wallet key + contract address
   npm start
   ```
   Live at `http://localhost:4000/health`. **BLOCK requests work with no `.env`
   filled in — only APPROVE (which signs a real testnet tx) needs real values.**

3. This frontend:
   ```
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`.

## Attestcoin Protocol verification

Thamannah's `/evaluate` now returns an optional `verified_evidence` object
when Hadi's Attestcoin Protocol verification actually ran:

```json
{
  "decision": "APPROVE",
  "risk_level": "LOW",
  "policy_status": "PASS",
  "reason": "string",
  "recommended_action": "RELEASE",
  "verified_evidence": {
    "chainKey": 1,
    "blockHeight": 11626486,
    "txHash": "0x70f2a7b8...",
    "verificationTxHash": "0x03806d349b...",
    "block_explorer_url": "https://creditcoin-testnet.blockscout.com/tx/0x..."
  }
}
```

`verified_evidence` is optional — it's absent for cases where verification
didn't run. `src/components/VerifiedOnChainBadge.tsx` renders a
"✅ Verified on-chain" section with a Blockscout link whenever it's
present (shown under the Evidence Card on `/agent/[id]` and inside the
"Evidence retrieved" entry on `/audit/[id]`); nothing renders when it's
missing, so older responses without it still display fine.

## What's built

| Screen | Route | Owner | What it does |
|---|---|---|---|
| Request creation | `/` | Anha | Borrower submits wallet + evidence, calls `POST /evaluate` |
| Agent status | `/agent/[id]` | Anha | Animates the agent's step sequence, then shows the result |
| Audit timeline | `/audit/[id]` | Anha | Chronological ledger: request → evidence → decision → policy → action |
| Evidence Card | `components/EvidenceCard.tsx` | Asad | Shows verified evidence exactly as retrieved |
| Decision Card | `components/DecisionCard.tsx` | Asad | Shows AI decision, risk level, policy result, reasoning |

There's no backend persistence yet, so a `CaseRecord` (request + response
+ real Creditcoin action result) is carried between screens via
`sessionStorage` (`src/lib/store.ts`), keyed by a client-generated
`request_id`. Once Thamannah/Hadi add a real audit-log endpoint, swap
`loadCase()`/`saveCase()` for a fetch call — nothing else needs to change,
since every screen already keys off `request_id`.

## How the two backends connect

The frontend calls both services in sequence (see `handleSubmit` in
`src/app/page.tsx`):

1. `POST http://localhost:8000/evaluate` → Thamannah's decision
   (`APPROVE`/`BLOCK`, risk, policy status, reason).
2. `POST http://localhost:4000/creditcoin-action` with
   `{ decision, borrower_wallet_address, amount_usdc }` → Hadi's real
   Creditcoin result. For `APPROVE` this signs and confirms a real testnet
   transaction (`action_type: "release_collateral"`, a `transaction_hash`,
   and a Blockscout `block_explorer_url`). For `BLOCK` it returns
   `status: "not_executed"` with no transaction — nothing happens
   on-chain.

If the Creditcoin service is unreachable or errors, the frontend doesn't
crash the whole flow — it shows `status: "error"` with the reason, and the
evaluation result still displays normally.

## Reliability fallback

The home page has a **"Load counterfactual demo"** link that loads Hadi's
placeholder BLOCK payload (500 required / 200 actual) instantly, skipping
the live API call. Use this during the pitch if the live Gemini call or
backend is flaky — it's the exact scenario from the demo script (FR-09 /
counterfactual test).

