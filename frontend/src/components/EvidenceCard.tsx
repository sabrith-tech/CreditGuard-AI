import { Evidence } from "@/lib/types";
import { Stamp } from "./Stamp";

export function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const rows: [string, string][] = [
    ["Event", evidence.event],
    ["Amount", `${evidence.amount.toLocaleString()} ${evidence.asset}`],
    ["Source chain", evidence.source_chain],
  ];

  return (
    <div className="rounded-lg border border-line bg-panel overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-faint">
            Exhibit A
          </p>
          <h3 className="font-display text-base font-bold text-text-primary mt-0.5">
            Evidence
          </h3>
        </div>
        <Stamp
          label={evidence.verified ? "Verified" : "Unverified"}
          tone={evidence.verified ? "verified" : "block"}
        />
      </div>

      <dl className="divide-y divide-line-soft">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-3"
          >
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="font-mono text-sm text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="px-5 py-3 text-[11px] font-mono text-text-faint border-t border-line-soft bg-panel-raised">
        This record reflects the cross-chain event exactly as retrieved. No
        field is inferred or invented by the AI agent.
      </p>
    </div>
  );
}
