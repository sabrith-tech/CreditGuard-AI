"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { LedgerEntry } from "@/components/LedgerEntry";
import { Stamp } from "@/components/Stamp";
import { VerifiedOnChainBadge } from "@/components/VerifiedOnChainBadge";
import { loadCase } from "@/lib/store";
import { CaseRecord } from "@/lib/types";

function fmtTime(iso: string, offsetSec: number) {
  const d = new Date(new Date(iso).getTime() + offsetSec * 1000);
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export default function AuditTrailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<CaseRecord | null | undefined>(undefined);

  useEffect(() => {
    setRecord(loadCase(id));
  }, [id]);

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

  const { request, response, creditcoin_action, created_at } = record;
  const approved = response.decision === "APPROVE";

  return (
    <main className="min-h-screen">
      <header className="border-b border-line-soft px-6 py-5 flex items-center justify-between">
        <Wordmark eyebrow={`Case ${record.request_id}`} />
        <Link
          href="/"
          className="font-mono text-xs text-text-faint hover:text-text-muted transition-colors"
        >
          New request
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-chain mb-3">
          Audit trail · 03
        </p>
        <h1 className="font-display text-2xl font-bold leading-tight mb-1">
          Chain of custody
        </h1>
        <p className="text-text-muted text-sm mb-10">
          Every important decision here traces back to the evidence that
          produced it.
        </p>

        <LedgerEntry index={1} timestamp={fmtTime(created_at, 0)} title="Request submitted">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Borrower wallet</span>
            <span className="font-mono text-text-primary">{request.wallet}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1.5">
            <span className="text-text-muted">Requested amount</span>
            <span className="font-mono text-text-primary">
              {request.requestedAmount.toLocaleString()} USDC
            </span>
          </div>
        </LedgerEntry>

        <LedgerEntry index={2} timestamp={fmtTime(created_at, 4)} title="Evidence retrieved">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {request.evidenceBase.event} on {request.evidenceBase.source_chain}
            </span>
            <Stamp
              label={response.verified_evidence ? "Verified" : "Unverified"}
              tone={response.verified_evidence ? "verified" : "block"}
              small
            />
          </div>
          <p className="font-mono text-xs text-text-faint mt-2">
            {request.evidenceBase.amount.toLocaleString()} {request.evidenceBase.asset}
          </p>
          <p className="font-mono text-[10px] text-text-faint mt-1 break-all">
            source tx: {request.sourceTxHash}
          </p>
          {response.verified_evidence && (
            <VerifiedOnChainBadge verifiedEvidence={response.verified_evidence} />
          )}
        </LedgerEntry>

        <LedgerEntry index={3} timestamp={fmtTime(created_at, 9)} title="AI agent decision">
          <p className="text-sm text-text-primary/90 leading-relaxed">
            {response.reason}
          </p>
          <p className="font-mono text-xs text-text-faint mt-2">
            Risk: {response.risk_level}
          </p>
        </LedgerEntry>

        <LedgerEntry index={4} timestamp={fmtTime(created_at, 11)} title="Policy engine result">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Deterministic check, independent of the AI
            </span>
            <Stamp
              label={`Policy ${response.policy_status}`}
              tone={response.policy_status === "PASS" ? "verified" : "block"}
              small
            />
          </div>
        </LedgerEntry>

        <LedgerEntry
          index={5}
          timestamp={fmtTime(created_at, 14)}
          title="Creditcoin action"
          isLast
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {creditcoin_action?.status === "confirmed" &&
                "releaseCollateral confirmed on-chain"}
              {creditcoin_action?.status === "not_executed" &&
                (creditcoin_action?.reason ?? "policy_condition_failed")}
              {creditcoin_action?.status === "error" &&
                "Action service unavailable"}
            </span>
            <Stamp
              label={
                creditcoin_action?.status === "confirmed"
                  ? "Confirmed"
                  : creditcoin_action?.status === "error"
                  ? "Unavailable"
                  : "Withheld"
              }
              tone={
                creditcoin_action?.status === "confirmed"
                  ? "chain"
                  : creditcoin_action?.status === "error"
                  ? "pending"
                  : "block"
              }
              small
            />
          </div>
          {creditcoin_action?.transaction_hash && (
            <div className="flex items-center justify-between mt-2">
              <p className="font-mono text-[11px] text-text-faint break-all">
                tx: {creditcoin_action.transaction_hash}
              </p>
              {creditcoin_action.block_explorer_url && (
                <a
                  href={creditcoin_action.block_explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-chain hover:opacity-80 transition-opacity whitespace-nowrap ml-3"
                >
                  Blockscout →
                </a>
              )}
            </div>
          )}
        </LedgerEntry>

        <div className="hr-line my-10" />

        <p className="text-center text-sm text-text-muted">
          Final outcome:{" "}
          <span
            className="font-mono font-medium"
            style={{ color: approved ? "var(--verified)" : "var(--block)" }}
          >
            {response.decision}
          </span>
        </p>
      </div>
    </main>
  );
}
