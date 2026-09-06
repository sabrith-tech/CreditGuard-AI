"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { AgentStepper } from "@/components/AgentStepper";
import { EvidenceCard } from "@/components/EvidenceCard";
import { DecisionCard } from "@/components/DecisionCard";
import { VerifiedOnChainBadge } from "@/components/VerifiedOnChainBadge";
import { Stamp } from "@/components/Stamp";
import { loadCase } from "@/lib/store";
import { CaseRecord } from "@/lib/types";

const STEP_DELAY_MS = 850;

export default function AgentStatusPage() {
  const { id } = useParams<{ id: string }>();
  const instant = useSearchParams().get("instant") === "1";
  const [record, setRecord] = useState<CaseRecord | null | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(instant ? 5 : 0);

  useEffect(() => {
    setRecord(loadCase(id));
  }, [id]);

  useEffect(() => {
    if (instant || activeIndex >= 5) return;
    const t = setTimeout(() => setActiveIndex((i) => i + 1), STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [activeIndex, instant]);

  if (record === undefined) return null;

  if (record === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-text-muted text-sm mb-3">
            No case found for request <span className="font-mono">{id}</span>.
          </p>
          <Link href="/" className="text-chain text-sm underline">
            Start a new request
          </Link>
        </div>
      </main>
    );
  }

  const steps = [
    {
      label: "Verifying source-chain evidence",
      detail: `${record.request.evidenceBase.source_chain} · Attestcoin Protocol`,
    },
    {
      label: "AI agent analyzing evidence",
      detail: "Structured reasoning over the verification result",
    },
    {
      label: "Policy engine checking conditions",
      detail: "actual_repayment_usdc ≥ required_repayment_usdc",
    },
    {
      label: "Decision issued",
      detail: `${record.response.decision} · policy ${record.response.policy_status}`,
    },
    {
      label:
        record.response.decision === "APPROVE"
          ? "Firing Creditcoin transaction"
          : "Confirming no action taken",
      detail:
        record.response.decision === "APPROVE"
          ? "Signing releaseCollateral on Creditcoin testnet"
          : "Policy failed — nothing sent on-chain",
    },
  ];

  const done = activeIndex >= steps.length;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line-soft px-6 py-5 flex items-center justify-between">
        <Wordmark eyebrow={`Case ${record.request_id}`} />
        {done && (
          <Link
            href={`/audit/${record.request_id}`}
            className="font-mono text-xs text-chain hover:opacity-80 transition-opacity"
          >
            View audit trail →
          </Link>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-[220px_1fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-chain mb-3">
            Agent status · 02
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight">
            {done ? "Evaluation complete" : "Evaluating request…"}
          </h1>
        </div>

        <div>
          <AgentStepper steps={steps} activeIndex={activeIndex} />
        </div>
      </div>

      {done && (
        <div className="max-w-3xl mx-auto px-6 pb-16 animate-fade-up">
          <div className="hr-line mb-10" />
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <EvidenceCard
                evidence={{
                  ...record.request.evidenceBase,
                  verified: !!record.response.verified_evidence,
                }}
              />
              {record.response.verified_evidence && (
                <VerifiedOnChainBadge
                  verifiedEvidence={record.response.verified_evidence}
                />
              )}
            </div>
            <DecisionCard response={record.response} />
          </div>

          <div className="mt-6 rounded-lg border border-line bg-panel px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-faint mb-1">
                  Exhibit C · Creditcoin action
                </p>
                <p className="text-sm text-text-muted">
                  {record.creditcoin_action?.status === "confirmed" &&
                    "Transaction confirmed on Creditcoin testnet."}
                  {record.creditcoin_action?.status === "not_executed" &&
                    "No action taken — policy condition failed."}
                  {record.creditcoin_action?.status === "error" &&
                    (record.creditcoin_action?.reason ??
                      "Creditcoin action service unavailable.")}
                </p>
              </div>
              <Stamp
                label={
                  record.creditcoin_action?.status === "confirmed"
                    ? "Confirmed"
                    : record.creditcoin_action?.status === "error"
                    ? "Unavailable"
                    : "Withheld"
                }
                tone={
                  record.creditcoin_action?.status === "confirmed"
                    ? "chain"
                    : record.creditcoin_action?.status === "error"
                    ? "pending"
                    : "block"
                }
              />
            </div>

            {record.creditcoin_action?.transaction_hash && (
              <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between">
                <span className="font-mono text-xs text-text-faint break-all">
                  {record.creditcoin_action.transaction_hash}
                </span>
                {record.creditcoin_action.block_explorer_url && (
                  <a
                    href={record.creditcoin_action.block_explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-chain hover:opacity-80 transition-opacity whitespace-nowrap ml-4"
                  >
                    View on Blockscout →
                  </a>
                )}
              </div>
            )}
          </div>

          <Link
            href={`/audit/${record.request_id}`}
            className="mt-8 inline-block text-sm font-medium text-chain hover:opacity-80 transition-opacity"
          >
            View the full audit trail →
          </Link>
        </div>
      )}
    </main>
  );
}
