import { VerifiedEvidence } from "@/lib/types";

export function VerifiedOnChainBadge({
  verifiedEvidence,
}: {
  verifiedEvidence: VerifiedEvidence;
}) {
  return (
    <div className="rounded-lg border border-verified-dim bg-verified-dim/10 px-4 py-3 mt-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium" style={{ color: "var(--verified)" }}>
          ✅ Verified on-chain
        </span>
        <a
          href={verifiedEvidence.block_explorer_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-chain hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          View on Blockscout →
        </a>
      </div>
      <p className="text-[11px] text-text-muted mt-1.5">
        Cross-chain event independently verified via the Attestcoin Protocol
        — this is not just a claim, it&apos;s cryptographic proof.
      </p>
      <div className="font-mono text-[10px] text-text-faint mt-2 space-y-0.5">
        <p className="break-all">source tx: {verifiedEvidence.txHash}</p>
        <p className="break-all">
          verification tx: {verifiedEvidence.verificationTxHash}
        </p>
      </div>
    </div>
  );
}
