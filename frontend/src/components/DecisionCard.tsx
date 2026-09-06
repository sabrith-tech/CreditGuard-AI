import { EvaluationResponse } from "@/lib/types";
import { Stamp } from "./Stamp";

const RISK_TONE = {
  LOW: "verified",
  MEDIUM: "pending",
  HIGH: "block",
} as const;

export function DecisionCard({ response }: { response: EvaluationResponse }) {
  const isApprove = response.decision === "APPROVE";

  return (
    <div className="rounded-lg border border-line bg-panel overflow-hidden">
      <div className="px-5 py-4 border-b border-line-soft">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-faint">
          Exhibit B
        </p>
        <h3 className="font-display text-base font-bold text-text-primary mt-0.5">
          AI Decision
        </h3>
      </div>

      <div className="px-5 py-4 flex flex-wrap gap-2">
        <Stamp
          label={response.decision}
          tone={isApprove ? "verified" : "block"}
          small
        />
        <Stamp
          label={`Risk: ${response.risk_level}`}
          tone={RISK_TONE[response.risk_level]}
          small
        />
        <Stamp
          label={`Policy ${response.policy_status}`}
          tone={response.policy_status === "PASS" ? "verified" : "block"}
          small
        />
      </div>

      <div className="px-5 pb-4">
        <p className="text-[11px] uppercase tracking-wider text-text-faint mb-1.5">
          Reasoning
        </p>
        <p className="text-sm leading-relaxed text-text-primary/90 border-l-2 border-line pl-3">
          {response.reason}
        </p>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-line-soft bg-panel-raised">
        <span className="text-xs text-text-muted">Recommended action</span>
        <span
          className="font-mono text-xs font-medium"
          style={{ color: isApprove ? "var(--verified)" : "var(--block)" }}
        >
          {response.recommended_action}
        </span>
      </div>
    </div>
  );
}
