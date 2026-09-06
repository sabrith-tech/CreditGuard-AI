"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import {
  evaluateWithVerification,
  requestCreditcoinAction,
  ApiError,
} from "@/lib/api";
import { saveCase, makeRequestId, blockDemoCase } from "@/lib/store";
import { EvaluateWithVerificationRequest } from "@/lib/types";

const CHAINS = ["ethereum_sepolia", "Ethereum", "Polygon", "Avalanche"];

export default function RequestPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [requestedAmount, setRequestedAmount] = useState<number | "">("");
  const [event, setEvent] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [asset, setAsset] = useState("");
  const [sourceChain, setSourceChain] = useState(CHAINS[0]);
  const [sourceTxHash, setSourceTxHash] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] =
    useState<EvaluateWithVerificationRequest | null>(null);

  async function submit(payload: EvaluateWithVerificationRequest) {
    setLoading(true);
    setError(null);
    setLastPayload(payload);
    try {
      const response = await evaluateWithVerification(payload);
      // The policy engine's decision (not the AI) is what's sent onward —
      // the Creditcoin action service only ever sees APPROVE or BLOCK.
      const creditcoinAction = await requestCreditcoinAction(
        response.decision,
        payload.wallet,
        payload.requestedAmount
      );
      const requestId = makeRequestId();
      saveCase({
        request_id: requestId,
        created_at: new Date().toISOString(),
        request: payload,
        response,
        creditcoin_action: creditcoinAction,
      });
      router.push(`/agent/${requestId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requestedAmount === "" || amount === "") return;
    submit({
      wallet,
      requestedAmount,
      evidenceBase: { event, amount, asset, source_chain: sourceChain },
      sourceTxHash,
    });
  }

  function loadBlockDemo() {
    const record = blockDemoCase();
    router.push(`/agent/${record.request_id}?instant=1`);
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line-soft px-6 py-5">
        <Wordmark eyebrow="Proof-driven financing" />
      </header>

      <div className="max-w-xl mx-auto px-6 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-chain mb-3">
          New request
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight mb-2">
          Request a financing decision
        </h1>
        <p className="text-text-muted text-sm mb-10 leading-relaxed">
         Submit the borrower wallet and source-chain transaction.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Borrower wallet">
            <input
              className="input font-mono"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              required
            />
          </Field>

          <Field label="Requested amount (USDC)">
            <input
              type="number"
              className="input font-mono"
              placeholder="500"
              value={requestedAmount}
              onChange={(e) =>
                setRequestedAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              min={0}
              required
            />
          </Field>

          <div className="hr-line my-2" />
          <p className="text-[11px] uppercase tracking-wider text-text-faint">
            Evidence
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Event">
              <input
                className="input"
                placeholder="repayment"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                required
              />
            </Field>
            <Field label="Asset">
              <input
                className="input"
                placeholder="USDC"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                required
              />
            </Field>
            <Field label="Evidence amount">
              <input
                type="number"
                className="input font-mono"
                placeholder="500"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                min={0}
                required
              />
            </Field>
            <Field label="Source chain">
              <select
                className="input"
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
              >
                {CHAINS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Source transaction hash">
            <input
              className="input font-mono"
              placeholder="0x..."
              value={sourceTxHash}
              onChange={(e) => setSourceTxHash(e.target.value)}
              required
            />
          </Field>
          <p className="text-[11px] text-text-faint -mt-4">
            The real on-chain transaction Attestcoin will verify.
          </p>

          {error && (
            <div className="text-sm text-block border border-block-dim bg-block-dim/10 rounded-md px-3 py-2 flex items-start justify-between gap-3">
              <span>{error}</span>
              {lastPayload && (
                <button
                  type="button"
                  onClick={() => submit(lastPayload)}
                  className="shrink-0 text-xs font-medium underline hover:opacity-80 transition-opacity"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-chain text-ink font-medium text-sm py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? "Verifying + evaluating this can take a while "
              : "Submit for evaluation"}
          </button>
        </form>

        <div className="hr-line my-8" />

        <button
          onClick={loadBlockDemo}
          className="text-xs font-mono text-text-faint hover:text-text-muted transition-colors"
        >
          → Load counterfactual demo (insufficient repayment, policy blocks action)
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
        .input:focus {
          outline: none;
          border-color: var(--chain);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
